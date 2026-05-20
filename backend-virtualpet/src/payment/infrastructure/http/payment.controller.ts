import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { PAYMENT_SERVICE } from '../../application/ports/inbound/payment-service.port';
import type { IPaymentService } from '../../application/ports/inbound/payment-service.port';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../../dto/update-payment-status.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentService: IPaymentService,
  ) {}

  @Public()
  @Get('methods')
  getPaymentMethods() {
    return this.paymentService.getPaymentMethods();
  }

  @Post()
  @Roles('BACKOFFICE')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Public()
  @Get('orders/:orderId')
  getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Patch('orders/:orderId/status')
  @Roles('BACKOFFICE')
  updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentService.updatePaymentStatus(orderId, dto.status);
  }
}
