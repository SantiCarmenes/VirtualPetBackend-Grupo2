import type { ShipmentStatusEnum } from '../../../domain/shipment-status.enum';

export const SHIPPING_REPOSITORY = 'SHIPPING_REPOSITORY';

export interface ShippingMethodDto {
  id:            string;
  name:          string;
  description:   string | null;
  basePrice:     { toString(): string };
  estimatedDays: number | null;
  active:        boolean;
}

export interface ShipmentWithMethod {
  id:                string;
  orderId:           string;
  methodId:          string;
  riderId:           string | null;
  takenAt:           Date | null;
  status:            string;
  trackingNumber:    string | null;
  estimatedDelivery: Date | null;
  createdAt:         Date;
  updatedAt:         Date;
  method:            { name: string };
}

export interface IShippingRepository {
  findAllMethods(): Promise<ShippingMethodDto[]>;
  findMethodById(id: string): Promise<ShippingMethodDto | null>;
  createShipment(data: {
    orderId:            string;
    methodId:           string;
    estimatedDelivery?: Date;
  }): Promise<ShipmentWithMethod>;
  findShipmentByOrderId(orderId: string): Promise<ShipmentWithMethod | null>;
  findShipmentsByOrderId(orderId: string): Promise<ShipmentWithMethod[]>;
  /** orderId (distintos) que alguna vez tuvieron un envío asignado a este rider. */
  findOrderIdsByRiderId(riderId: string): Promise<string[]>;
  updateShipmentStatus(shipmentId: string, status: ShipmentStatusEnum, trackingNumber?: string): Promise<ShipmentWithMethod>;
  assignRider(shipmentId: string, riderId: string): Promise<ShipmentWithMethod>;
}
