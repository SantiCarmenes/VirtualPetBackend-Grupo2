import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { InventoryModule } from '../inventory/inventory.module';
import { MailModule } from '../mail/mail.module';
import { PaymentModule } from '../payment/payment.module';
import { ShippingModule } from '../shipping/shipping.module';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { PromotionController } from './controllers/promotion.controller';
import { CART_SERVICE } from './interfaces/cart-service.interface';
import { CHECKOUT_SERVICE } from './interfaces/checkout-service.interface';
import { ORDER_SERVICE } from './interfaces/order-service.interface';
import { PROMOTION_SERVICE } from './interfaces/promotion-service.interface';
import { OrderRepository } from './order.repository';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { OrderService } from './services/order.service';
import { PromotionService } from './services/promotion.service';

@Module({
  imports: [CatalogModule, InventoryModule, MailModule, ShippingModule, PaymentModule],
  controllers: [CartController, OrderController, PromotionController],
  providers: [
    OrderRepository,
    CartService,
    CheckoutService,
    OrderService,
    PromotionService,
    { provide: CART_SERVICE,    useClass: CartService },
    { provide: CHECKOUT_SERVICE, useClass: CheckoutService },
    { provide: ORDER_SERVICE,   useClass: OrderService },
    { provide: PROMOTION_SERVICE, useClass: PromotionService },
  ],
  exports: [ORDER_SERVICE, OrderService],
})
export class OrderModule {}
