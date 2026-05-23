import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatusEnum } from '../domain/payment-status.enum';
import type { IPaymentService } from './ports/inbound/payment-service.port';
import { PAYMENT_REPOSITORY } from './ports/outbound/payment-repository.port';
import type { IPaymentRepository } from './ports/outbound/payment-repository.port';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PAYMENT_METHOD_OPTIONS } from '../domain/payment-method.enum';
import type { PaymentMethodOption } from '../domain/payment-method.enum';

@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
  ) {}

  getPaymentMethods(): PaymentMethodOption[] {
    return PAYMENT_METHOD_OPTIONS;
  }

  createPayment(dto: CreatePaymentDto) {
    return this.paymentRepository.create({
      orderId:  dto.orderId,
      method:   dto.method,
      amount:   dto.amount,
      currency: dto.currency,
    });
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('Pago no encontrado para esta orden');
    return payment;
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatusEnum) {
    const existing = await this.paymentRepository.findByOrderId(orderId);
    if (!existing) throw new NotFoundException('Pago no encontrado para esta orden');
    return this.paymentRepository.updateStatus(orderId, status);
  }
}
