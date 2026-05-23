import { IsBoolean, IsDateString, IsInt, IsObject, IsOptional, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsInt()
  @Min(1)
  maxUses: number;

  @IsObject()
  conditions: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
