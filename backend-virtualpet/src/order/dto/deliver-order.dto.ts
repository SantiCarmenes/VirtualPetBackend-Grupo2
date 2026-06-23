import { IsString, Length, Matches } from 'class-validator';

export class DeliverOrderDto {
  @IsString()
  @Length(6, 6, { message: 'El código de entrega debe tener 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código de entrega debe ser numérico' })
  code: string;
}
