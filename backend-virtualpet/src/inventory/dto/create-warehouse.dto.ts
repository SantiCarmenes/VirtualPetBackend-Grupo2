import { IsObject, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsObject()
  address: Record<string, unknown>;
}
