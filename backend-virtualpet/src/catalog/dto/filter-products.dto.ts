import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class FilterProductsDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  // IDs de AttributeValue para filtrar por animal, color, talla, etc.
  // Ej: ?attributeValueIds=uuid-perro&attributeValueIds=uuid-gato
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('all', { each: true })
  attributeValueIds?: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
