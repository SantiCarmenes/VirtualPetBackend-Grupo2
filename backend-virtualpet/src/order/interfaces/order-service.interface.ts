import type { Order } from '@prisma/client';
import { CheckoutDto } from '../dto/checkout.dto';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

export const ORDER_SERVICE = 'ORDER_SERVICE';

/** Refleja el modelo Payment de Prisma (disponible tras `prisma generate`). */
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

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderService {
  checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult>;
  guestCheckout(dto: GuestCheckoutDto): Promise<CheckoutResult>;
  findMyOrders(userId: string): Promise<Order[]>;
  findMyOrdersPaginated(userId: string, page: number, limit: number): Promise<PaginatedOrders>;
  findOrderById(orderId: string): Promise<Order & { payment: unknown; shipment: unknown }>;
  updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order>;
  findAllOrders(): Promise<Order[]>;
  findAllOrdersPaginated(page: number, limit: number): Promise<PaginatedOrders>;
  claimGuestOrders(email: string, userId: string): Promise<void>;
  processPaymentWebhook(orderId: string, result: 'approved' | 'rejected'): Promise<void>;
}
