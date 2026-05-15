import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.sanitize(user);
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updated = await this.userService.update(user.id, dto);
    return this.sanitize(updated);
  }

  @Get()
  @Roles('BACKOFFICE')
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((u) => this.sanitize(u));
  }

  @Get(':id')
  @Roles('BACKOFFICE')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(user);
  }

  private sanitize(user: User) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}