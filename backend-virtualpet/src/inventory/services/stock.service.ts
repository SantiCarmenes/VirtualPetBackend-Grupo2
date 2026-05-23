import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { IStockService } from '../interfaces/stock-service.interface';
import { InventoryRepository } from '../inventory.repository';
import { UpsertStockDto } from '../dto/upsert-stock.dto';
import { WarehouseService } from './warehouse.service';

@Injectable()
export class StockService implements IStockService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly warehouseService: WarehouseService,
  ) {}

  async upsertStock(dto: UpsertStockDto) {
    await this.warehouseService.findWarehouseById(dto.warehouseId);
    return this.inventoryRepository.upsertStockItem(dto);
  }

  async getStockByVariant(variantId: string) {
    const quantityAvailable = await this.inventoryRepository.getTotalAvailable(variantId);
    return { variantId, quantityAvailable };
  }

  async reserveStock(orderId: string, items: { variantId: string; quantity: number }[]) {
    const warehouseId = await this.inventoryRepository.findWarehouseForOrder(items);
    if (!warehouseId) {
      throw new UnprocessableEntityException(
        'No hay suficiente stock para completar el pedido.',
      );
    }
    await this.inventoryRepository.atomicReserveFromWarehouse(warehouseId, orderId, items);
  }

  async releaseReservation(orderId: string) {
    const reservations = await this.inventoryRepository.findReservationsByOrder(orderId);
    await Promise.all(
      reservations.map((r) =>
        Promise.all([
          this.inventoryRepository.incrementAvailable(r.stockItemId, r.quantity),
          this.inventoryRepository.deleteReservation(r.id),
        ]),
      ),
    );
  }

  async confirmReservation(orderId: string) {
    const reservations = await this.inventoryRepository.findReservationsByOrder(orderId);
    await Promise.all(
      reservations.map((r) =>
        Promise.all([
          this.inventoryRepository.decrementReserved(r.stockItemId, r.quantity),
          this.inventoryRepository.deleteReservation(r.id),
        ]),
      ),
    );
  }
}
