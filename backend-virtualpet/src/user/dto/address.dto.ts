import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString({ message: 'La calle es requerida.' })
  @MinLength(2, { message: 'La calle debe tener al menos 2 caracteres.' })
  street!: string;

  @IsString({ message: 'La ciudad es requerida.' })
  city!: string;

  @IsString({ message: 'La provincia es requerida.' })
  province!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: 'La calle es requerida.' })
  @MinLength(2, { message: 'La calle debe tener al menos 2 caracteres.' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'La ciudad es requerida.' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'La provincia es requerida.' })
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
