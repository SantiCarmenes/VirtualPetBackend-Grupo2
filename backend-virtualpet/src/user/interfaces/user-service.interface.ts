import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

export const USER_SERVICE = 'USER_SERVICE';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: string, dto: UpdateProfileDto): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
}