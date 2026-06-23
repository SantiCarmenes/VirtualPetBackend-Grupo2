import type { ShipmentStatusEnum } from '../../../domain/shipment-status.enum';
import type { ShippingMethodDto } from '../outbound/shipping-repository.port';
import type { CreateShipmentDto } from '../../../dto/create-shipment.dto';

export const SHIPPING_SERVICE = 'SHIPPING_SERVICE';

export interface ShipmentResponse {
  id:                string;
  orderId:           string;
  methodId:          string;
  methodName:        string;
  riderId:           string | null;
  riderName:         string | null;
  takenAt:           Date | null;
  status:            string;
  trackingNumber:    string | null;
  estimatedDelivery: Date | null;
  createdAt:         Date;
}

export interface IShippingService {
  getShippingMethods(): Promise<ShippingMethodDto[]>;
  findShippingMethodById(id: string): Promise<ShippingMethodDto | null>;
  createShipment(dto: CreateShipmentDto): Promise<ShipmentResponse>;
  getShipmentByOrderId(orderId: string): Promise<ShipmentResponse>;
  getShipmentsByOrderId(orderId: string): Promise<ShipmentResponse[]>;
  /** orderId (distintos) que alguna vez tuvieron un envío asignado a este rider. */
  findOrderIdsByRiderId(riderId: string): Promise<string[]>;
  updateShipmentStatus(orderId: string, status: ShipmentStatusEnum, trackingNumber?: string): Promise<ShipmentResponse>;
  assignRider(orderId: string, riderId: string): Promise<ShipmentResponse>;
  releaseShipment(orderId: string): Promise<ShipmentResponse>;
}
