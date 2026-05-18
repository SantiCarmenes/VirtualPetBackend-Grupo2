import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  getAddresses(userId: string) {
    return this.addressRepository.findByUserId(userId);
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const existing = await this.addressRepository.findByUserId(userId);
    // Primera dirección o marcada como default → limpiar defaults anteriores
    if (dto.isDefault || existing.length === 0) {
      await this.addressRepository.clearDefaults(userId);
      dto.isDefault = true;
    }
    return this.addressRepository.create(userId, dto);
  }

  async updateAddress(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new NotFoundException('Dirección no encontrada.');
    if (address.userId !== userId) throw new ForbiddenException('No podés modificar esta dirección.');

    if (dto.isDefault) {
      await this.addressRepository.clearDefaults(userId);
    }
    return this.addressRepository.update(id, dto);
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new NotFoundException('Dirección no encontrada.');
    if (address.userId !== userId) throw new ForbiddenException('No podés eliminar esta dirección.');

    await this.addressRepository.delete(id);

    // Si era la default, asignar la siguiente disponible
    if (address.isDefault) {
      await this.addressRepository.setFirstAsDefault(userId);
    }
  }
}
