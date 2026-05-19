import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  }

  findById(id: string) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  create(userId: string, dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        street: dto.street,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode ?? '',
        isDefault: dto.isDefault ?? false,
        user: { connect: { id: userId } },
      },
    });
  }

  update(id: string, dto: UpdateAddressDto) {
    return this.prisma.address.update({
      where: { id },
      data: {
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.province !== undefined && { province: dto.province }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  clearDefaults(userId: string) {
    return this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  setFirstAsDefault(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
    }).then((addr) => {
      if (addr) return this.prisma.address.update({ where: { id: addr.id }, data: { isDefault: true } });
    });
  }
}
