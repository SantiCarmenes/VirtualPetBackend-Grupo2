import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PaymentStatusEnum } from '../../payment/domain/payment-status.enum';
import { STOCK_SERVICE } from '../../inventory/interfaces/stock-service.interface';
import type { IStockService } from '../../inventory/interfaces/stock-service.interface';
import { PAYMENT_SERVICE } from '../../payment/application/ports/inbound/payment-service.port';
import type { IPaymentService } from '../../payment/application/ports/inbound/payment-service.port';
import { SHIPPING_SERVICE } from '../../shipping/application/ports/inbound/shipping-service.port';
import type { IShippingService } from '../../shipping/application/ports/inbound/shipping-service.port';
import { ShipmentStatusEnum } from '../../shipping/domain/shipment-status.enum';
import { MailService } from '../../mail/mail.service';
import { OrderRepository } from '../order.repository';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import type { IOrderService, OrderStats } from '../interfaces/order-service.interface';

const MAX_DELIVERY_ATTEMPTS = 3;

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.RECEIVED]:       [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.IN_TRANSIT,     OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]:     [OrderStatus.DELIVERED,      OrderStatus.NOT_DELIVERED],
  [OrderStatus.NOT_DELIVERED]:  [OrderStatus.IN_TRANSIT,     OrderStatus.CANCELLED],
};

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    @Inject(STOCK_SERVICE)    private readonly stockService: IStockService,
    @Inject(PAYMENT_SERVICE)  private readonly paymentService: IPaymentService,
    @Inject(SHIPPING_SERVICE) private readonly shippingService: IShippingService,
  ) {}

  async findMyOrders(userId: string) {
    return this.orderRepository.findOrdersByUserId(userId);
  }

  async findMyOrdersPaginated(userId: string, page: number, limit: number) {
    return this.orderRepository.findOrdersByUserIdPaginated(userId, page, limit);
  }

  async findOrderById(orderId: string) {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');

    const [paymentResult, shipmentResult] = await Promise.allSettled([
      this.paymentService.getPaymentByOrderId(orderId),
      this.shippingService.getShipmentByOrderId(orderId),
    ]);

    return {
      ...order,
      payment:  paymentResult.status  === 'fulfilled' ? paymentResult.value  : null,
      shipment: shipmentResult.status === 'fulfilled' ? shipmentResult.value : null,
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Transición inválida: ${order.status} → ${dto.status}`);
    }

    if (dto.status === OrderStatus.IN_TRANSIT && order.deliveryAttempts === 0) {
      await this.stockService.confirmReservation(orderId);
    }

    if (dto.status === OrderStatus.CANCELLED && order.deliveryAttempts === 0) {
      await this.stockService.releaseReservation(orderId);
    }

    let updateData: Prisma.OrderUpdateInput = { status: dto.status };

    if (dto.status === OrderStatus.NOT_DELIVERED) {
      const newAttempts = order.deliveryAttempts + 1;
      if (newAttempts >= MAX_DELIVERY_ATTEMPTS) {
        updateData = { status: OrderStatus.CANCELLED, deliveryAttempts: newAttempts, nextDeliveryAt: null };
      } else {
        const nextDelivery = new Date();
        nextDelivery.setHours(nextDelivery.getHours() + 24);
        updateData = { status: OrderStatus.NOT_DELIVERED, deliveryAttempts: newAttempts, nextDeliveryAt: nextDelivery };
      }
    }

    const updated = await this.orderRepository.updateOrder(orderId, updateData);

    await this.orderRepository.addStatusHistory(orderId, updated.status);
    void this.mailService.sendOrderStatusUpdate(updated, updated.status);

    if (updated.status === OrderStatus.IN_TRANSIT) {
      const tracking = dto.trackingNumber ?? `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      void this.shippingService.updateShipmentStatus(orderId, ShipmentStatusEnum.SHIPPED, tracking).catch(() => {});
    } else if (updated.status === OrderStatus.DELIVERED) {
      void this.shippingService.updateShipmentStatus(orderId, ShipmentStatusEnum.DELIVERED).catch(() => {});
    }

    return updated;
  }

  async findAllOrders() {
    return this.orderRepository.findAllOrders();
  }

  async findAllOrdersPaginated(page: number, limit: number, status?: OrderStatus) {
    return this.orderRepository.findAllOrdersPaginated(page, limit, status);
  }

  async getOrderStats(): Promise<OrderStats> {
    const counts = await this.orderRepository.countByStatus();
    const total  = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      RECEIVED:       counts['RECEIVED']       ?? 0,
      IN_PREPARATION: counts['IN_PREPARATION'] ?? 0,
      IN_TRANSIT:     counts['IN_TRANSIT']     ?? 0,
      DELIVERED:      counts['DELIVERED']      ?? 0,
      NOT_DELIVERED:  counts['NOT_DELIVERED']  ?? 0,
      CANCELLED:      counts['CANCELLED']      ?? 0,
      total,
    };
  }

  async claimGuestOrders(email: string, userId: string): Promise<void> {
    await this.orderRepository.claimGuestOrders(email, userId);
  }

  async processPaymentWebhook(orderId: string, result: 'approved' | 'rejected'): Promise<void> {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (result === 'approved') {
      await this.paymentService.updatePaymentStatus(orderId, PaymentStatusEnum.APPROVED);
    } else {
      await this.paymentService.updatePaymentStatus(orderId, PaymentStatusEnum.REJECTED);
      await this.stockService.releaseReservation(orderId);
      await this.orderRepository.updateOrder(orderId, { status: OrderStatus.CANCELLED });
      await this.orderRepository.addStatusHistory(orderId, OrderStatus.CANCELLED);
    }
  }

  async requestInvoice(orderId: string, cuit: string, userId: string) {
    if (!/^\d{11}$/.test(cuit)) {
      throw new BadRequestException('El CUIT debe tener exactamente 11 dígitos numéricos');
    }

    const order = await this.orderRepository.findOrderWithHistoryByIdAndUserId(orderId, userId);
    if (!order) throw new NotFoundException('Orden no encontrada o no pertenece al usuario');

    const BILLABLE_STATUSES: OrderStatus[] = [
      OrderStatus.RECEIVED,
      OrderStatus.IN_PREPARATION,
      OrderStatus.IN_TRANSIT,
      OrderStatus.DELIVERED,
    ];
    if (!BILLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        'Solo se puede solicitar factura de pedidos confirmados (no cancelados ni con entrega fallida)',
      );
    }

    if (order.requiresInvoice) {
      throw new BadRequestException('Este pedido ya tiene factura solicitada');
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    if (
      createdAt.getMonth() !== now.getMonth() ||
      createdAt.getFullYear() !== now.getFullYear()
    ) {
      throw new BadRequestException(
        'Solo podés solicitar factura dentro del mes en el que se realizó el pedido',
      );
    }

    return this.orderRepository.requestInvoice(orderId, cuit);
  }

  async processPendingReschedules(): Promise<void> {
    const orders = await this.orderRepository.findOrdersPendingReschedule();
    for (const order of orders) {
      const updated = await this.orderRepository.updateOrder(order.id, {
        status: OrderStatus.IN_TRANSIT,
        nextDeliveryAt: null,
      });
      await this.orderRepository.addStatusHistory(order.id, OrderStatus.IN_TRANSIT);
      void this.mailService.sendOrderStatusUpdate(updated, OrderStatus.IN_TRANSIT);
    }
  }
}
