import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  cedula: string;

  @IsNotEmpty()
  @IsString()
  clave: string;
}
