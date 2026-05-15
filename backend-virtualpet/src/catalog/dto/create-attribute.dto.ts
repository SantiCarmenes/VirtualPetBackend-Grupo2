import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AttributeTypeDto {
  TEXT = 'TEXT',
  NUMERIC = 'NUMERIC',
  COLOR = 'COLOR',
  BOOLEAN = 'BOOLEAN',
}

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsEnum(AttributeTypeDto)
  type: AttributeTypeDto;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  filterable?: boolean;
}
