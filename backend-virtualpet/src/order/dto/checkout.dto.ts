import { IsEmail, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethodEnum } from '../../payment/domain/payment-method.enum';

export class CheckoutDto {
  @IsEmail()
  customerEmail!: string;

  @IsString()
  customerName!: string;

  @IsObject()
  shippingAddress!: Record<string, unknown>;

  @IsEnum(PaymentMethodEnum)
  paymentMethodCode!: PaymentMethodEnum;

  @IsOptional()
  @IsUUID()
  shippingMethodId?: string;
}
