import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShipmentDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  methodId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  estimatedDelivery?: Date;
}
