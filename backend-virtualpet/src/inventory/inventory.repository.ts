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

  /**
   * Busca el primer almacén que tenga stock suficiente de TODOS los ítems del pedido.
   * Retorna el warehouseId o null si ningún almacén puede surtir el pedido completo.
   */
  async findWarehouseForOrder(
    items: { variantId: string; quantity: number }[],
  ): Promise<string | null> {
    if (!items.length) return null;

    const stockItems = await this.prisma.stockItem.findMany({
      where: { variantId: { in: items.map((i) => i.variantId) } },
      select: { id: true, warehouseId: true, variantId: true, quantityAvailable: true },
    });

    // Agrupar por almacén
    const byWarehouse = new Map<string, typeof stockItems>();
    for (const si of stockItems) {
      const list = byWarehouse.get(si.warehouseId) ?? [];
      list.push(si);
      byWarehouse.set(si.warehouseId, list);
    }

    for (const [warehouseId, warehouseItems] of byWarehouse) {
      const fulfillsAll = items.every((required) => {
        const si = warehouseItems.find((w) => w.variantId === required.variantId);
        return si && si.quantityAvailable >= required.quantity;
      });
      if (fulfillsAll) return warehouseId;
    }
    return null;
  }

  /**
   * Reserva todos los ítems del pedido desde un único almacén de forma atómica.
   * Usa updateMany con WHERE condicional (cuantityAvailable >= qty) para eliminar
   * la condición de carrera: si otro request consumió stock entre el findWarehouse
   * y este método, el updateMany devuelve count=0 y la transacción falla.
   */
  async atomicReserveFromWarehouse(
    warehouseId: string,
    orderId: string,
    items: { variantId: string; quantity: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.stockItem.updateMany({
          where: {
            warehouseId,
            variantId: item.variantId,
            quantityAvailable: { gte: item.quantity },
          },
          data: {
            quantityAvailable: { decrement: item.quantity },
            quantityReserved: { increment: item.quantity },
          },
        });
        if (updated.count === 0) {
          throw new Error(
            `Stock insuficiente para la variante ${item.variantId}. Intentá de nuevo.`,
          );
        }
        const stockItem = await tx.stockItem.findUnique({
          where: { variantId_warehouseId: { variantId: item.variantId, warehouseId } },
          select: { id: true },
        });
        await tx.stockReservation.create({
          data: {
            variantId: item.variantId,
            orderId,
            stockItemId: stockItem!.id,
            quantity: item.quantity,
          },
        });
      }
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
