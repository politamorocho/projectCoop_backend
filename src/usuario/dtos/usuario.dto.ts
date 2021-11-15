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
  @IsNotEmpty({ message: 'No se permiten campos vacios' })
  @IsString({ message: 'Debe ingresar un nombre válido' })
  nombre: string;

  @IsNotEmpty({ message: 'No se permiten campos vacios' })
  @IsString({ message: 'Debe ingresar un apellido válido' })
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

  @IsMongoId({ message: 'Debe ingresar un rol válido' })
  @IsNotEmpty({ message: 'No se permiten campos vacios' })
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

export class IdDto {
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
