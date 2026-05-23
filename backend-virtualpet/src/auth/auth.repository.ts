import { Injectable } from '@nestjs/common';
import type { PasswordResetToken, RefreshToken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  createRefreshToken(data: { userId: string; token: string; expiresAt: Date }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  deleteRefreshToken(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteAllUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({ where: { token } });
  }

  createPasswordResetToken(data: { userId: string; token: string; expiresAt: Date }): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({ data });
  }

  deletePasswordResetToken(id: string): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.delete({ where: { id } });
  }

  deleteAllUserPasswordResetTokens(userId: string) {
    return this.prisma.passwordResetToken.deleteMany({ where: { userId } });
  }
}
