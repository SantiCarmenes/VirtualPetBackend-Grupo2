import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentController } from './infrastructure/http/payment.controller';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { PaymentService } from './application/payment.service';
import { PAYMENT_SERVICE } from './application/ports/inbound/payment-service.port';
import { PAYMENT_REPOSITORY } from './application/ports/outbound/payment-repository.port';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    PaymentService,
    { provide: PAYMENT_REPOSITORY, useClass: PaymentRepository },
    { provide: PAYMENT_SERVICE,    useClass: PaymentService },
  ],
  exports: [PAYMENT_SERVICE],
})
export class PaymentModule {}
