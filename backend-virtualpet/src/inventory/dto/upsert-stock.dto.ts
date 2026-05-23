import { IsInt, IsUUID, Min } from 'class-validator';

export class UpsertStockDto {
  @IsUUID()
  variantId: string;

  @IsUUID()
  warehouseId: string;

  @IsInt()
  @Min(0)
  quantityAvailable: number;
}
