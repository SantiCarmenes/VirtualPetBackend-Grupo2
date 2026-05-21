import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PaymentStatusEnum } from '../../payment/domain/payment-status.enum';
import { CATALOG_SERVICE } from '../../catalog/interfaces/catalog-service.interface';
import type { ICatalogService } from '../../catalog/interfaces/catalog-service.interface';
import { STOCK_SERVICE } from '../../inventory/interfaces/stock-service.interface';
import type { IStockService } from '../../inventory/interfaces/stock-service.interface';
import { PAYMENT_SERVICE } from '../../payment/application/ports/inbound/payment-service.port';
import type { IPaymentService } from '../../payment/application/ports/inbound/payment-service.port';
import { SHIPPING_SERVICE } from '../../shipping/application/ports/inbound/shipping-service.port';
import type { IShippingService } from '../../shipping/application/ports/inbound/shipping-service.port';
import { CheckoutResult, IOrderService } from '../interfaces/order-service.interface';
import { OrderRepository } from '../order.repository';
import { CheckoutDto } from '../dto/checkout.dto';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { MailService } from '../../mail/mail.service';

const MAX_DELIVERY_ATTEMPTS = 3;

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.RECEIVED]:       [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]:     [OrderStatus.DELIVERED, OrderStatus.NOT_DELIVERED],
  [OrderStatus.NOT_DELIVERED]:  [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
};

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    @Inject(CATALOG_SERVICE) private readonly catalogService: ICatalogService,
    @Inject(STOCK_SERVICE) private readonly stockService: IStockService,
    @Inject(PAYMENT_SERVICE) private readonly paymentService: IPaymentService,
    @Inject(SHIPPING_SERVICE) private readonly shippingService: IShippingService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    const cart = await this.orderRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const itemSnapshots = await Promise.all(
      cart.items.map(async (item) => {
        const variant = await this.catalogService.findVariantById(item.variantId);
        if (!variant) {
          throw new UnprocessableEntityException(
            'Uno de los productos en tu carrito ya no está disponible.',
          );
        }
        if (!variant.active) {
          throw new UnprocessableEntityException(
            `El producto "${variant.product.name}" ya no está disponible.`,
          );
        }
        const lineTotal = new Prisma.Decimal(item.priceSnapshot).mul(item.quantity);
        return {
          variantId: item.variantId,
          skuSnapshot: variant.sku,
          productNameSnapshot: variant.product.name,
          quantity: item.quantity,
          unitPrice: item.priceSnapshot,
          lineTotal,
        };
      }),
    );

    await this.stockService.checkStockOrThrow(
      cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );

    const subtotal = itemSnapshots.reduce(
      (acc, i) => acc.add(i.lineTotal),
      new Prisma.Decimal(0),
    );

    let shippingCost = new Prisma.Decimal(0);
    if (dto.shippingMethodId) {
      const method = await this.shippingService.findShippingMethodById(dto.shippingMethodId);
      if (method) shippingCost = new Prisma.Decimal(method.basePrice.toString());
    }

    const discountTotal = new Prisma.Decimal(0);
    const total = subtotal.add(shippingCost);

    const order = await this.orderRepository.createOrder({
      userId,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      shippingAddress: dto.shippingAddress as object,
      subtotal,
      shippingCost,
      discountTotal,
      total,
      items: {
        create: itemSnapshots.map((item) => ({
          variantId: item.variantId,
          skuSnapshot: item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    });

    await this.stockService.reserveStock(
      order.id,
      cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );

    await this.orderRepository.deleteCartItems(cart.id);

    const payment = await this.paymentService.createPayment({
      orderId: order.id,
      method: dto.paymentMethodCode,
      amount: order.total.toString(),
      currency: order.currency,
    });

    if (dto.shippingMethodId) {
      await this.shippingService.createShipment({
        orderId: order.id,
        methodId: dto.shippingMethodId,
      });
    }

    void this.mailService.sendOrderConfirmation(order);

    return { order, payment };
  }

  async guestCheckout(dto: GuestCheckoutDto): Promise<CheckoutResult> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const itemSnapshots = await Promise.all(
      dto.items.map(async (item) => {
        const variant = await this.catalogService.findVariantById(item.variantId);
        if (!variant) {
          throw new UnprocessableEntityException(
            'Uno de los productos en tu carrito ya no está disponible.',
          );
        }
        if (!variant.active) {
          throw new UnprocessableEntityException(
            `El producto "${variant.product.name}" ya no está disponible.`,
          );
        }
        const lineTotal = new Prisma.Decimal(variant.price.toString()).mul(item.quantity);
        return {
          variantId: item.variantId,
          skuSnapshot: variant.sku,
          productNameSnapshot: variant.product.name,
          quantity: item.quantity,
          unitPrice: variant.price,
          lineTotal,
        };
      }),
    );

    await this.stockService.checkStockOrThrow(
      dto.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );

    const subtotal = itemSnapshots.reduce(
      (acc, i) => acc.add(i.lineTotal),
      new Prisma.Decimal(0),
    );

    let shippingCost = new Prisma.Decimal(0);
    if (dto.shippingMethodId) {
      const method = await this.shippingService.findShippingMethodById(dto.shippingMethodId);
      if (method) shippingCost = new Prisma.Decimal(method.basePrice.toString());
    }

    const total = subtotal.add(shippingCost);
    const guestUserId = `guest-${crypto.randomUUID()}`;

    const order = await this.orderRepository.createOrder({
      userId: guestUserId,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      shippingAddress: dto.shippingAddress as object,
      subtotal,
      shippingCost,
      discountTotal: new Prisma.Decimal(0),
      total,
      items: {
        create: itemSnapshots.map((item) => ({
          variantId: item.variantId,
          skuSnapshot: item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    });

    await this.stockService.reserveStock(
      order.id,
      dto.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );

    const payment = await this.paymentService.createPayment({
      orderId: order.id,
      method: dto.paymentMethodCode,
      amount: order.total.toString(),
      currency: order.currency,
    });

    if (dto.shippingMethodId) {
      await this.shippingService.createShipment({
        orderId: order.id,
        methodId: dto.shippingMethodId,
      });
    }

    void this.mailService.sendOrderConfirmation(order);

    return { order, payment };
  }

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
      throw new BadRequestException(
        `Transición inválida: ${order.status} → ${dto.status}`,
      );
    }

    // Stock: confirmar reserva solo en el primer despacho
    if (dto.status === OrderStatus.IN_TRANSIT && order.deliveryAttempts === 0) {
      await this.stockService.confirmReservation(orderId);
    }

    // Stock: liberar reserva solo si nunca salió a reparto
    if (dto.status === OrderStatus.CANCELLED && order.deliveryAttempts === 0) {
      await this.stockService.releaseReservation(orderId);
    }

    let updateData: Prisma.OrderUpdateInput = { status: dto.status };

    if (dto.status === OrderStatus.NOT_DELIVERED) {
      const newAttempts = order.deliveryAttempts + 1;

      if (newAttempts >= MAX_DELIVERY_ATTEMPTS) {
        // Tercer fallo → cancelar automáticamente
        updateData = {
          status: OrderStatus.CANCELLED,
          deliveryAttempts: newAttempts,
          nextDeliveryAt: null,
        };
      } else {
        const nextDelivery = new Date();
        nextDelivery.setHours(nextDelivery.getHours() + 24);
        updateData = {
          status: OrderStatus.NOT_DELIVERED,
          deliveryAttempts: newAttempts,
          nextDeliveryAt: nextDelivery,
        };
      }
    }

    const updated = await this.orderRepository.updateOrder(orderId, updateData);
    void this.mailService.sendOrderStatusUpdate(updated, updated.status);
    return updated;
  }

  async findAllOrders() {
    return this.orderRepository.findAllOrders();
  }

  async findAllOrdersPaginated(page: number, limit: number) {
    return this.orderRepository.findAllOrdersPaginated(page, limit);
  }

  async claimGuestOrders(email: string, userId: string): Promise<void> {
    await this.orderRepository.claimGuestOrders(email, userId);
  }

  async processPaymentWebhook(orderId: string, result: 'approved' | 'rejected'): Promise<void> {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (result === 'approved') {
      await this.paymentService.updatePaymentStatus(orderId, PaymentStatusEnum.APPROVED);
      // El pedido ya está en RECEIVED; no se necesita cambio de estado
    } else {
      await this.paymentService.updatePaymentStatus(orderId, PaymentStatusEnum.REJECTED);
      await this.stockService.releaseReservation(orderId);
      await this.orderRepository.updateOrder(orderId, { status: OrderStatus.CANCELLED });
    }
  }

  async processPendingReschedules(): Promise<void> {
    const orders = await this.orderRepository.findOrdersPendingReschedule();
    for (const order of orders) {
      const updated = await this.orderRepository.updateOrder(order.id, {
        status: OrderStatus.IN_TRANSIT,
        nextDeliveryAt: null,
      });
      void this.mailService.sendOrderStatusUpdate(updated, OrderStatus.IN_TRANSIT);
    }
  }
}
