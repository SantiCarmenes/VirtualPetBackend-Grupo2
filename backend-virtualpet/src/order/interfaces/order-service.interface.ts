import type { Order, OrderStatus } from '@prisma/client';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

export const ORDER_SERVICE = 'ORDER_SERVICE';

export interface PaymentResult {
  id:        string;
  orderId:   string;
  method:    string;
  status:    string;
  amount:    unknown;
  currency:  string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutResult {
  order:   Order;
  payment: PaymentResult;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedOrders {
  data: Order[];
  pagination: PaginationMeta;
}

export interface OrderStats {
  RECEIVED: number;
  IN_PREPARATION: number;
  IN_TRANSIT: number;
  DELIVERED: number;
  NOT_DELIVERED: number;
  CANCELLED: number;
  total: number;
}

export interface IOrderService {
  findMyOrders(userId: string): Promise<Order[]>;
  findMyOrdersPaginated(userId: string, page: number, limit: number): Promise<PaginatedOrders>;
  findOrderById(orderId: string): Promise<Order & { payment: unknown; shipment: unknown }>;
  updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order>;
  findAllOrders(): Promise<Order[]>;
  findAllOrdersPaginated(page: number, limit: number, status?: OrderStatus): Promise<PaginatedOrders>;
  getOrderStats(): Promise<OrderStats>;
  claimGuestOrders(email: string, userId: string): Promise<void>;
  processPaymentWebhook(orderId: string, result: 'approved' | 'rejected'): Promise<void>;
  requestInvoice(orderId: string, cuit: string, userId: string): Promise<Order>;
  findAvailableOrders(page: number, limit: number): Promise<PaginatedOrders>;
  riderPickup(orderId: string, riderId: string): Promise<Order>;
  riderDeliver(orderId: string, riderId: string): Promise<Order>;
  riderReturn(orderId: string, riderId: string): Promise<Order>;
}
