import { PartialType } from '@nestjs/mapped-types';
import { TipoEmpleado } from '../models/usuario.tipo.model';
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsOptional()
  //@IsEmail()
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
  @IsEnum(TipoEmpleado)
  tipo: TipoEmpleado;

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

export class RecuperarClaveDto {
  @IsNotEmpty()
  @IsEmail()
  correo: string;
}

export class FijarNuevaClaveDto {
  @IsNotEmpty()
  @IsString()
  claveNueva: string;

  @IsNotEmpty()
  @IsString()
  codigo: string;
}
