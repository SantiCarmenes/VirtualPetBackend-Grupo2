import { Body, Controller, DefaultValuePipe, ForbiddenException, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApplyPromotionDto } from '../dto/apply-promotion.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { GuestCheckoutDto } from '../dto/guest-checkout.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CHECKOUT_SERVICE } from '../interfaces/checkout-service.interface';
import type { ICheckoutService } from '../interfaces/checkout-service.interface';
import { ORDER_SERVICE } from '../interfaces/order-service.interface';
import type { IOrderService } from '../interfaces/order-service.interface';
import { PROMOTION_SERVICE } from '../interfaces/promotion-service.interface';
import type { IPromotionService } from '../interfaces/promotion-service.interface';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(CHECKOUT_SERVICE) private readonly checkoutService: ICheckoutService,
    @Inject(ORDER_SERVICE)    private readonly orderService: IOrderService,
    @Inject(PROMOTION_SERVICE) private readonly promotionService: IPromotionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  checkout(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user.id, dto);
  }

  @Public()
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  guestCheckout(@Body() dto: GuestCheckoutDto) {
    return this.checkoutService.guestCheckout(dto);
  }

  @Get()
  findMyOrders(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.orderService.findMyOrdersPaginated(user.id, page, limit);
  }

  @Get('stats')
  @Roles('BACKOFFICE')
  getStats() {
    return this.orderService.getOrderStats();
  }

  @Get('all')
  @Roles('BACKOFFICE')
  findAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.findAllOrdersPaginated(page, limit, status);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const order = await this.orderService.findOrderById(id);
    if (user.role !== 'BACKOFFICE' && (order as any).userId !== user.id) {
      throw new ForbiddenException('No tenés acceso a esta orden');
    }
    return order;
  }

  @Public()
  @Get(':id/track')
  trackOrder(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @Patch(':id/status')
  @Roles('BACKOFFICE')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(id, dto);
  }

  @Public()
  @Post(':id/payment-webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  paymentWebhook(@Param('id') id: string, @Body() dto: PaymentWebhookDto) {
    return this.orderService.processPaymentWebhook(id, dto.result);
  }

  @Post(':id/promotions')
  applyPromotion(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ApplyPromotionDto,
  ) {
    return this.promotionService.applyPromotion(user.id, id, dto);
  }
}
