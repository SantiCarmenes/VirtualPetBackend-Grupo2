import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { IPaymentRepository, PaymentCreateData } from '../../application/ports/outbound/payment-repository.port';
import type { PaymentStatusEnum } from '../../domain/payment-status.enum';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  private readonly p: any;

  constructor(prisma: PrismaService) {
    this.p = prisma;
  }

  create(data: PaymentCreateData) {
    return this.p.payment.create({
      data: {
        orderId:  data.orderId,
        method:   data.method,
        status:   'PENDING',
        amount:   data.amount,
        currency: data.currency,
      },
    });
  }

  findByOrderId(orderId: string) {
    return this.p.payment.findUnique({ where: { orderId } });
  }

  updateStatus(orderId: string, status: PaymentStatusEnum) {
    return this.p.payment.update({
      where: { orderId },
      data:  { status },
    });
  }
}
