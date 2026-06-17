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
  updateShipmentStatus(orderId: string, status: ShipmentStatusEnum, trackingNumber?: string): Promise<ShipmentWithMethod>;
  assignRider(orderId: string, riderId: string): Promise<ShipmentWithMethod>;
}
