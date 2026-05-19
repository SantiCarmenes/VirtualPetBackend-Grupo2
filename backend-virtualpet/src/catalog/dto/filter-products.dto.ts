import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class FilterProductsDto {
  // Soporta una o múltiples categorías: ?categoryIds=uuid1,uuid2 o ?categoryIds=uuid1&categoryIds=uuid2
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.flatMap((v) => v.split(',').filter(Boolean));
    return value.split(',').filter(Boolean);
  })
  @IsArray()
  @IsUUID('all', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  // IDs de AttributeValue para filtrar por animal, color, talla, etc.
  // Soporta: ?attributeValueIds=uuid1,uuid2 o ?attributeValueIds=uuid1&attributeValueIds=uuid2
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.flatMap((v) => v.split(',').filter(Boolean));
    return value.split(',').filter(Boolean);
  })
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

  @IsOptional()
  @IsIn(['menor', 'mayor', 'destacados'])
  sort?: 'menor' | 'mayor' | 'destacados';

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
