import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const user = await this.userService.create(dto);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    return this.generateTokens(user);
  }

  async refresh(token: string): Promise<AuthTokens> {
    const stored = await this.authRepository.findRefreshToken(token);

    if (!stored) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (stored.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(stored.id);
      throw new UnauthorizedException('Refresh token expirado');
    }

    const user = await this.userService.findById(stored.userId);
    if (!user || !user.isActive) {
      await this.authRepository.deleteAllUserRefreshTokens(stored.userId);
      throw new UnauthorizedException('Usuario inactivo');
    }

    await this.authRepository.deleteRefreshToken(stored.id);
    return this.generateTokens(user);
  }

  async logout(token: string): Promise<void> {
    const stored = await this.authRepository.findRefreshToken(token);
    if (stored) {
      await this.authRepository.deleteRefreshToken(stored.id);
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);

    // Siempre respondemos OK para no exponer si el email existe
    if (!user || !user.isActive) {
      return { message: 'Si el email existe, recibirás un enlace de recuperación.' };
    }

    await this.authRepository.deleteAllUserPasswordResetTokens(user.id);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.authRepository.createPasswordResetToken({ userId: user.id, token, expiresAt });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordReset(email, resetUrl);

    return { message: 'Si el email existe, recibirás un enlace de recuperación.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const stored = await this.authRepository.findPasswordResetToken(token);

    if (!stored) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (stored.expiresAt < new Date()) {
      await this.authRepository.deletePasswordResetToken(stored.id);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userService.findById(stored.userId);
    if (!user || !user.isActive) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(user.id, passwordHash);

    await this.authRepository.deletePasswordResetToken(stored.id);
    await this.authRepository.deleteAllUserRefreshTokens(user.id);

    return { message: 'Contraseña actualizada correctamente.' };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.authRepository.createRefreshToken({ userId: user.id, token: refreshToken, expiresAt });

    return { accessToken, refreshToken };
  }
}
