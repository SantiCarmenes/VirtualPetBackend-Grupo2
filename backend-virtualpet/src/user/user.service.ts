import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IUserService } from './interfaces/user-service.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const emailInUse = await this.userRepository.findByEmail(dto.email);
    if (emailInUse) throw new ConflictException('El email ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const username = `${dto.email.split('@')[0]}-${Date.now().toString(36)}`;

    return this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username,
      email: dto.email,
      passwordHash,
      role: dto.role ?? 'CLIENT',
    });
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.userRepository.updatePassword(id, passwordHash);
  }

  async update(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.userRepository.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }
}