import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { CATALOG_SERVICE } from '../../catalog/interfaces/catalog-service.interface';
import type { ICatalogService } from '../../catalog/interfaces/catalog-service.interface';
import { STOCK_SERVICE } from '../../inventory/interfaces/stock-service.interface';
import type { IStockService } from '../../inventory/interfaces/stock-service.interface';
import { PAYMENT_SERVICE } from '../../payment/application/ports/inbound/payment-service.port';
import type { IPaymentService } from '../../payment/application/ports/inbound/payment-service.port';
import { SHIPPING_SERVICE } from '../../shipping/application/ports/inbound/shipping-service.port';
import type { IShippingService } from '../../shipping/application/ports/inbound/shipping-service.port';
import { MailService } from '../../mail/mail.service';
import { OrderRepository } from '../order.repository';
import { CheckoutDto } from '../dto/checkout.dto';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';
import type { CheckoutResult } from '../interfaces/order-service.interface';
import type { ICheckoutService } from '../interfaces/checkout-service.interface';

@Injectable()
export class CheckoutService implements ICheckoutService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    @Inject(CATALOG_SERVICE) private readonly catalogService: ICatalogService,
    @Inject(STOCK_SERVICE)   private readonly stockService: IStockService,
    @Inject(PAYMENT_SERVICE) private readonly paymentService: IPaymentService,
    @Inject(SHIPPING_SERVICE) private readonly shippingService: IShippingService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    const cart = await this.orderRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const variantIds = cart.items.map((i) => i.variantId);
    const variants   = await this.catalogService.findVariantsByIds(variantIds);
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Validar disponibilidad y detectar cambios de precio en un solo recorrido
    const priceChanges: { variantId: string; name: string; oldPrice: number; newPrice: number }[] = [];

    for (const item of cart.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new UnprocessableEntityException('Uno de los productos en tu carrito ya no está disponible.');
      if (!variant.active) throw new UnprocessableEntityException(`El producto "${variant.product.name}" ya no está disponible.`);

      const snapshot = new Prisma.Decimal(item.priceSnapshot);
      const current  = new Prisma.Decimal(variant.price);
      if (!snapshot.equals(current)) {
        priceChanges.push({
          variantId: item.variantId,
          name:      variant.product.name,
          oldPrice:  snapshot.toNumber(),
          newPrice:  current.toNumber(),
        });
      }
    }

    if (priceChanges.length > 0 && !dto.acceptPriceChanges) {
      throw new HttpException(
        {
          statusCode:   HttpStatus.CONFLICT,
          message:      'Algunos precios cambiaron desde que agregaste los productos al carrito.',
          priceChanges,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Siempre usar el precio actual al crear la orden (consistente con lo que el usuario ve en el carrito)
    const itemSnapshots = cart.items.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      return {
        variantId:           item.variantId,
        skuSnapshot:         variant.sku,
        productNameSnapshot: variant.product.name,
        quantity:            item.quantity,
        unitPrice:           variant.price,
        lineTotal:           new Prisma.Decimal(variant.price.toString()).mul(item.quantity),
      };
    });

    const subtotal     = itemSnapshots.reduce((acc, i) => acc.add(i.lineTotal), new Prisma.Decimal(0));
    let shippingCost   = new Prisma.Decimal(0);
    if (dto.shippingMethodId) {
      const method = await this.shippingService.findShippingMethodById(dto.shippingMethodId);
      if (method) shippingCost = new Prisma.Decimal(method.basePrice.toString());
    }

    const order = await this.orderRepository.createOrder({
      userId,
      customerEmail:   dto.customerEmail,
      customerName:    dto.customerName,
      shippingAddress: dto.shippingAddress as object,
      subtotal,
      shippingCost,
      discountTotal: new Prisma.Decimal(0),
      total: subtotal.add(shippingCost),
      items: {
        create: itemSnapshots.map((item) => ({
          variantId:           item.variantId,
          skuSnapshot:         item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          quantity:            item.quantity,
          unitPrice:           item.unitPrice,
          lineTotal:           item.lineTotal,
        })),
      },
    });

    try {
      await this.stockService.reserveStock(
        order.id,
        cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      );
    } catch (err) {
      await this.orderRepository.updateOrder(order.id, { status: OrderStatus.CANCELLED });
      await this.orderRepository.addStatusHistory(order.id, OrderStatus.CANCELLED);
      if (err instanceof HttpException) throw err;
      throw new UnprocessableEntityException(
        err instanceof Error ? err.message : 'No hay suficiente stock para completar el pedido.',
      );
    }

    await this.orderRepository.deleteCartItems(cart.id);

    const payment = await this.paymentService.createPayment({
      orderId:  order.id,
      method:   dto.paymentMethodCode,
      amount:   order.total.toString(),
      currency: order.currency,
    });

    if (dto.shippingMethodId) {
      await this.shippingService.createShipment({ orderId: order.id, methodId: dto.shippingMethodId });
    }

    await this.orderRepository.addStatusHistory(order.id, OrderStatus.RECEIVED);
    void this.mailService.sendOrderConfirmation(order);

    return { order, payment };
  }

  async guestCheckout(dto: GuestCheckoutDto): Promise<CheckoutResult> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants   = await this.catalogService.findVariantsByIds(variantIds);
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const itemSnapshots = dto.items.map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new UnprocessableEntityException('Uno de los productos en tu carrito ya no está disponible.');
      if (!variant.active) throw new UnprocessableEntityException(`El producto "${variant.product.name}" ya no está disponible.`);
      return {
        variantId:           item.variantId,
        skuSnapshot:         variant.sku,
        productNameSnapshot: variant.product.name,
        quantity:            item.quantity,
        unitPrice:           variant.price,
        lineTotal:           new Prisma.Decimal(variant.price.toString()).mul(item.quantity),
      };
    });

    const subtotal   = itemSnapshots.reduce((acc, i) => acc.add(i.lineTotal), new Prisma.Decimal(0));
    let shippingCost = new Prisma.Decimal(0);
    if (dto.shippingMethodId) {
      const method = await this.shippingService.findShippingMethodById(dto.shippingMethodId);
      if (method) shippingCost = new Prisma.Decimal(method.basePrice.toString());
    }

    const order = await this.orderRepository.createOrder({
      userId:          `guest-${crypto.randomUUID()}`,
      customerEmail:   dto.customerEmail,
      customerName:    dto.customerName,
      shippingAddress: dto.shippingAddress as object,
      subtotal,
      shippingCost,
      discountTotal: new Prisma.Decimal(0),
      total: subtotal.add(shippingCost),
      items: {
        create: itemSnapshots.map((item) => ({
          variantId:           item.variantId,
          skuSnapshot:         item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          quantity:            item.quantity,
          unitPrice:           item.unitPrice,
          lineTotal:           item.lineTotal,
        })),
      },
    });

    try {
      await this.stockService.reserveStock(
        order.id,
        dto.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      );
    } catch (err) {
      await this.orderRepository.updateOrder(order.id, { status: OrderStatus.CANCELLED });
      await this.orderRepository.addStatusHistory(order.id, OrderStatus.CANCELLED);
      if (err instanceof HttpException) throw err;
      throw new UnprocessableEntityException(
        err instanceof Error ? err.message : 'No hay suficiente stock para completar el pedido.',
      );
    }

    const payment = await this.paymentService.createPayment({
      orderId:  order.id,
      method:   dto.paymentMethodCode,
      amount:   order.total.toString(),
      currency: order.currency,
    });

    if (dto.shippingMethodId) {
      await this.shippingService.createShipment({ orderId: order.id, methodId: dto.shippingMethodId });
    }

    await this.orderRepository.addStatusHistory(order.id, OrderStatus.RECEIVED);
    void this.mailService.sendOrderConfirmation(order);

    return { order, payment };
  }
}
