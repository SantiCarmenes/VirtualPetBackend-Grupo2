import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ShipmentStatusEnum } from '../domain/shipment-status.enum';
import { IShippingService, ShipmentResponse } from './ports/inbound/shipping-service.port';
import { SHIPPING_REPOSITORY } from './ports/outbound/shipping-repository.port';
import type { IShippingRepository, ShipmentWithMethod } from './ports/outbound/shipping-repository.port';
import { CreateShipmentDto } from '../dto/create-shipment.dto';

@Injectable()
export class ShippingService implements IShippingService {
  constructor(
    @Inject(SHIPPING_REPOSITORY) private readonly shippingRepository: IShippingRepository,
  ) {}

  getShippingMethods() {
    return this.shippingRepository.findAllMethods();
  }

  findShippingMethodById(id: string) {
    return this.shippingRepository.findMethodById(id);
  }

  async createShipment(dto: CreateShipmentDto): Promise<ShipmentResponse> {
    const result = await this.shippingRepository.createShipment({
      orderId:           dto.orderId,
      methodId:          dto.methodId,
      estimatedDelivery: dto.estimatedDelivery,
    });
    return this.toResponse(result);
  }

  async getShipmentByOrderId(orderId: string): Promise<ShipmentResponse> {
    const result = await this.shippingRepository.findShipmentByOrderId(orderId);
    if (!result) throw new NotFoundException('Envío no encontrado para esta orden');
    return this.toResponse(result);
  }

  async updateShipmentStatus(orderId: string, status: ShipmentStatusEnum, trackingNumber?: string): Promise<ShipmentResponse> {
    const existing = await this.shippingRepository.findShipmentByOrderId(orderId);
    if (!existing) throw new NotFoundException('Envío no encontrado para esta orden');
    const result = await this.shippingRepository.updateShipmentStatus(orderId, status, trackingNumber);
    return this.toResponse(result);
  }

  private toResponse(shipment: ShipmentWithMethod): ShipmentResponse {
    const { method, updatedAt: _updatedAt, ...rest } = shipment;
    return { ...rest, methodName: method.name };
  }
}
