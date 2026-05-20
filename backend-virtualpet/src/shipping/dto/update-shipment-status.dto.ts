import { IsEnum } from 'class-validator';
import { ShipmentStatusEnum } from '../domain/shipment-status.enum';

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatusEnum)
  status!: ShipmentStatusEnum;
}
