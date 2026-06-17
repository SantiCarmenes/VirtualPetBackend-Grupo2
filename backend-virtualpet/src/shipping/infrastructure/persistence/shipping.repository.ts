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
    return this.p.shipment.findUnique({
      where: { orderId },
      include: { method: true },
    });
  }

  updateShipmentStatus(orderId: string, status: ShipmentStatusEnum, trackingNumber?: string) {
    return this.p.shipment.update({
      where:   { orderId },
      data:    { status, ...(trackingNumber ? { trackingNumber } : {}) },
      include: { method: true },
    });
  }

  assignRider(orderId: string, riderId: string) {
    return this.p.shipment.update({
      where:   { orderId },
      data:    { riderId, takenAt: new Date(), status: 'SHIPPED' },
      include: { method: true },
    });
  }
}
