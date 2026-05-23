import { IsEnum, IsString, IsUUID } from 'class-validator';
import { PaymentMethodEnum } from '../domain/payment-method.enum';

export class CreatePaymentDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(PaymentMethodEnum)
  method!: PaymentMethodEnum;

  @IsString()
  amount!: string;

  @IsString()
  currency!: string;
}
