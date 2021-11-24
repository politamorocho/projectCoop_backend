import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';

export class CrearViajeDto {
  @IsOptional()
  @IsDate()
  fechaHoraSalida: Date;

  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsMongoId({ message: 'Debe ingresar un empleado válido' })
  empleado1: string;

  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsString({ message: 'Debe ingresar un tipo de empleado válido' })
  tipoEmpleado1: string;

  @IsOptional()
  //@IsMongoId({ message: 'Debe ingresar un empleado válido' })
  empleado2: string;

  @IsOptional()
  //@IsString({ message: 'Debe ingresar un tipo de empleado válido' })
  tipoEmpleado2: string;

  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsMongoId({ message: 'Debe ingresar un bus válido' })
  bus: string;

  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsMongoId({ message: 'Debe ingresar una ruta válida' })
  ruta: string;
}

export class ActualizarViajeDto extends PartialType(CrearViajeDto) {}

export class FiltroViajeDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class AgregarEmpleado2Dto {
  @IsNotEmpty({ message: 'El campo no puede estar vacio' })
  @IsMongoId({ message: 'Debe ingresar un empleado válido' })
  empleado2: string;

  @IsNotEmpty({ message: 'El campo no puede estar vacio' })
  @IsString({ message: 'Debe ingresar un tipo de empleado válido' })
  tipoEmpleado2: string;
}
