import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../inventory.repository';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  createWarehouse(dto: CreateWarehouseDto) {
    return this.inventoryRepository.createWarehouse(dto);
  }

  findAllWarehouses() {
    return this.inventoryRepository.findAllWarehouses();
  }

  async findWarehouseById(id: string) {
    const warehouse = await this.inventoryRepository.findWarehouseById(id);
    if (!warehouse) throw new NotFoundException('Almacén no encontrado');
    return warehouse;
  }
}
