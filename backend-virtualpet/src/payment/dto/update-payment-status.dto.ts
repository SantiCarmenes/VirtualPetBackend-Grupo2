import { IsEnum } from 'class-validator';
import { PaymentStatusEnum } from '../domain/payment-status.enum';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatusEnum)
  status!: PaymentStatusEnum;
}
