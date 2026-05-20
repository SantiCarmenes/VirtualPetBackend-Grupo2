import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethodEnum } from '../../payment/domain/payment-method.enum';

export class GuestCartItemDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class GuestCheckoutDto {
  @IsEmail()
  customerEmail: string;

  @IsString()
  customerName: string;

  @IsObject()
  shippingAddress: Record<string, unknown>;

  @IsEnum(PaymentMethodEnum)
  paymentMethodCode: PaymentMethodEnum;

  @IsOptional()
  @IsUUID()
  shippingMethodId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items: GuestCartItemDto[];
}
