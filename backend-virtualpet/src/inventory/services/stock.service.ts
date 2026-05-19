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

  async checkStockOrThrow(items: { variantId: string; quantity: number }[]) {
    for (const item of items) {
      const available = await this.inventoryRepository.getTotalAvailable(item.variantId);
      if (available < item.quantity) {
        throw new UnprocessableEntityException(
          `Stock insuficiente: hay ${available} unidad${available === 1 ? '' : 'es'} disponible${available === 1 ? '' : 's'} pero se requieren ${item.quantity}.`,
        );
      }
    }
  }

  async reserveStock(orderId: string, items: { variantId: string; quantity: number }[]) {
    for (const item of items) {
      const stockItem = await this.inventoryRepository.findFirstAvailableStockItem(
        item.variantId,
        item.quantity,
      );
      if (!stockItem) {
        throw new UnprocessableEntityException(
          'No hay suficiente stock para completar el pedido.',
        );
      }
      await Promise.all([
        this.inventoryRepository.decrementAvailable(stockItem.id, item.quantity),
        this.inventoryRepository.createReservation({
          variantId: item.variantId,
          orderId,
          stockItem: { connect: { id: stockItem.id } },
          quantity: item.quantity,
        }),
      ]);
    }
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
