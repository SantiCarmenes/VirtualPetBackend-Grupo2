import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { IShippingRepository } from '../../application/ports/outbound/shipping-repository.port';
import type { ShipmentStatusEnum } from '../../domain/shipment-status.enum';

@Injectable()
export class ShippingRepository implements IShippingRepository {
  private readonly p: any;

  constructor(prisma: PrismaService) {
    this.p = prisma;
  }

  findAllMethods() {
    return this.p.shippingMethod.findMany({
      where: { active: true },
      orderBy: { basePrice: 'asc' },
    });
  }

  findMethodById(id: string) {
    return this.p.shippingMethod.findUnique({ where: { id } });
  }

  createShipment(data: { orderId: string; methodId: string; estimatedDelivery?: Date }) {
    return this.p.shipment.create({
      data: {
        orderId:           data.orderId,
        methodId:          data.methodId,
        estimatedDelivery: data.estimatedDelivery,
      },
      include: { method: true },
    });
  }

  findShipmentByOrderId(orderId: string) {
    return this.p.shipment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { method: true },
    });
  }

  findShipmentsByOrderId(orderId: string) {
    return this.p.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      include: { method: true },
    });
  }

  async findOrderIdsByRiderId(riderId: string): Promise<string[]> {
    const rows = await this.p.shipment.findMany({
      where: { riderId },
      select: { orderId: true },
      distinct: ['orderId'],
    });
    return rows.map((r: { orderId: string }) => r.orderId);
  }

  updateShipmentStatus(shipmentId: string, status: ShipmentStatusEnum, trackingNumber?: string) {
    return this.p.shipment.update({
      where:   { id: shipmentId },
      data:    { status, ...(trackingNumber ? { trackingNumber } : {}) },
      include: { method: true },
    });
  }

  assignRider(shipmentId: string, riderId: string) {
    return this.p.shipment.update({
      where:   { id: shipmentId },
      data:    { riderId, takenAt: new Date(), status: 'SHIPPED' },
      include: { method: true },
    });
  }
}
