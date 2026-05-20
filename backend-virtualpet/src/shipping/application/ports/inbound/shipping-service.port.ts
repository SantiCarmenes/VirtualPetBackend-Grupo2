import type { ShipmentStatusEnum } from '../../../domain/shipment-status.enum';
import type { ShippingMethodDto } from '../outbound/shipping-repository.port';
import type { CreateShipmentDto } from '../../../dto/create-shipment.dto';

export const SHIPPING_SERVICE = 'SHIPPING_SERVICE';

export interface ShipmentResponse {
  id:                string;
  orderId:           string;
  methodId:          string;
  methodName:        string;
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
  updateShipmentStatus(orderId: string, status: ShipmentStatusEnum): Promise<ShipmentResponse>;
}
