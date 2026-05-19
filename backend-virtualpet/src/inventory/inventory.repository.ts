import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpsertStockDto } from './dto/upsert-stock.dto';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Warehouses ───────────────────────────────────────────────────────────

  createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: { name: dto.name, code: dto.code, address: dto.address as object },
    });
  }

  findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { stockItems: true },
      orderBy: { name: 'asc' },
    });
  }

  findWarehouseById(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: { stockItems: true },
    });
  }

  // ─── Stock Items ──────────────────────────────────────────────────────────

  upsertStockItem(dto: UpsertStockDto) {
    return this.prisma.stockItem.upsert({
      where: { variantId_warehouseId: { variantId: dto.variantId, warehouseId: dto.warehouseId } },
      create: {
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        quantityAvailable: dto.quantityAvailable,
      },
      update: { quantityAvailable: dto.quantityAvailable },
    });
  }

  async getTotalAvailable(variantId: string): Promise<number> {
    const result = await this.prisma.stockItem.aggregate({
      where: { variantId },
      _sum: { quantityAvailable: true },
    });
    return result._sum.quantityAvailable ?? 0;
  }

  findFirstAvailableStockItem(variantId: string, requiredQuantity: number) {
    return this.prisma.stockItem.findFirst({
      where: { variantId, quantityAvailable: { gte: requiredQuantity } },
      orderBy: { quantityAvailable: 'desc' },
    });
  }

  decrementAvailable(stockItemId: string, quantity: number) {
    return this.prisma.stockItem.update({
      where: { id: stockItemId },
      data: {
        quantityAvailable: { decrement: quantity },
        quantityReserved: { increment: quantity },
      },
    });
  }

  incrementAvailable(stockItemId: string, quantity: number) {
    return this.prisma.stockItem.update({
      where: { id: stockItemId },
      data: {
        quantityAvailable: { increment: quantity },
        quantityReserved: { decrement: quantity },
      },
    });
  }

  decrementReserved(stockItemId: string, quantity: number) {
    return this.prisma.stockItem.update({
      where: { id: stockItemId },
      data: { quantityReserved: { decrement: quantity } },
    });
  }

  // ─── Reservations ─────────────────────────────────────────────────────────

  createReservation(data: Prisma.StockReservationCreateInput) {
    return this.prisma.stockReservation.create({ data });
  }

  findReservationsByOrder(orderId: string) {
    return this.prisma.stockReservation.findMany({ where: { orderId } });
  }

  deleteReservation(id: string) {
    return this.prisma.stockReservation.delete({ where: { id } });
  }
}
