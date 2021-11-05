import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsOptional()
  @IsEmail()
  correo: string;

  @IsOptional()
  @IsString()
  //@Max(10)
  cedula: string;

  @IsOptional()
  @IsString()
  //@Min(8)
  claveUsuario: string;

  @IsMongoId()
  @IsNotEmpty()
  rol: string;

  @IsOptional()
  tipo: string;

  @IsOptional()
  @IsBoolean()
  estado: boolean;
}

export class ActualizarUsuarioDto extends PartialType(CrearUsuarioDto) {}

export class FiltroUsuarioDto {
  @IsOptional()
  @Min(0)
  @Max(1)
  estado: number;

  @IsOptional()
  busqueda: string;

  @IsOptional()
  cedula: string;
}

export class IdUsuarioDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class CambiarClaveDto {
  @IsNotEmpty()
  @IsString()
  claveAnterior: string;

  @IsNotEmpty()
  @IsString()
  claveNueva: string;
}
