import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserService } from '../user/user.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

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
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const user = await this.userService.create(dto);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
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

    // Rotación: eliminar el token usado y emitir uno nuevo
    await this.authRepository.deleteRefreshToken(stored.id);
    return this.generateTokens(user);
  }

  async logout(token: string): Promise<void> {
    const stored = await this.authRepository.findRefreshToken(token);
    if (stored) {
      await this.authRepository.deleteRefreshToken(stored.id);
    }
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