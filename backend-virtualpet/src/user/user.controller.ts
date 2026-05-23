import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

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

  // ─── Direcciones ────────────────────────────────────────────

  @Get('me/addresses')
  getAddresses(@CurrentUser() user: User) {
    return this.addressService.getAddresses(user.id);
  }

  @Post('me/addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.addressService.createAddress(user.id, dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.addressService.deleteAddress(user.id, id);
  }

  private sanitize(user: User) {
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}