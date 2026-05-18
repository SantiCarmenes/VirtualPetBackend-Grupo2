import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre es requerido.' })
  firstName!: string;

  @IsString({ message: 'El apellido es requerido.' })
  lastName!: string;

  @IsString({ message: 'El nombre de usuario es requerido.' })
  username!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  email!: string;

  @IsString({ message: 'La contraseña es requerida.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password!: string;
}
