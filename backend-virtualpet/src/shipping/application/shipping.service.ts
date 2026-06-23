import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ShipmentStatusEnum } from '../domain/shipment-status.enum';
import { IShippingService, ShipmentResponse } from './ports/inbound/shipping-service.port';
import { SHIPPING_REPOSITORY } from './ports/outbound/shipping-repository.port';
import type { IShippingRepository, ShipmentWithMethod } from './ports/outbound/shipping-repository.port';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { USER_SERVICE } from '../../user/interfaces/user-service.interface';
import type { IUserService } from '../../user/interfaces/user-service.interface';

@Injectable()
export class ShippingService implements IShippingService {
  constructor(
    @Inject(SHIPPING_REPOSITORY) private readonly shippingRepository: IShippingRepository,
    @Inject(USER_SERVICE)        private readonly userService: IUserService,
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

  async getShipmentsByOrderId(orderId: string): Promise<ShipmentResponse[]> {
    const results = await this.shippingRepository.findShipmentsByOrderId(orderId);
    return Promise.all(results.map(s => this.toResponse(s)));
  }

  async updateShipmentStatus(orderId: string, status: ShipmentStatusEnum, trackingNumber?: string): Promise<ShipmentResponse> {
    const existing = await this.shippingRepository.findShipmentByOrderId(orderId);
    if (!existing) throw new NotFoundException('Envío no encontrado para esta orden');
    const result = await this.shippingRepository.updateShipmentStatus(existing.id, status, trackingNumber);
    return this.toResponse(result);
  }

  async assignRider(orderId: string, riderId: string): Promise<ShipmentResponse> {
    const shipment = await this.shippingRepository.findShipmentByOrderId(orderId);

    if (shipment && shipment.riderId && shipment.status === ShipmentStatusEnum.SHIPPED) {
      throw new BadRequestException('Esta orden ya tiene un rider asignado y está en camino');
    }

    if (!shipment || shipment.status === ShipmentStatusEnum.NOT_DELIVERED) {
      const methods = await this.shippingRepository.findAllMethods();
      if (!methods.length) throw new NotFoundException('No hay métodos de envío disponibles');
      const methodId = shipment?.methodId ?? methods[0].id;
      const newShipment = await this.shippingRepository.createShipment({ orderId, methodId });
      const result = await this.shippingRepository.assignRider(newShipment.id, riderId);
      return this.toResponse(result);
    }

    const result = await this.shippingRepository.assignRider(shipment.id, riderId);
    return this.toResponse(result);
  }

  async releaseShipment(orderId: string): Promise<ShipmentResponse> {
    const shipment = await this.shippingRepository.findShipmentByOrderId(orderId);
    if (!shipment) throw new NotFoundException('Envío no encontrado para esta orden');
    const result = await this.shippingRepository.updateShipmentStatus(shipment.id, ShipmentStatusEnum.NOT_DELIVERED);
    return this.toResponse(result);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async toResponse(shipment: ShipmentWithMethod): Promise<ShipmentResponse> {
    const { method, updatedAt: _updatedAt, ...rest } = shipment;

    let riderName: string | null = null;
    if (rest.riderId) {
      const rider = await this.userService.findById(rest.riderId);
      if (rider) riderName = `${rider.firstName} ${rider.lastName}`;
    }

    return { ...rest, methodName: method.name, riderName };
  }
}
