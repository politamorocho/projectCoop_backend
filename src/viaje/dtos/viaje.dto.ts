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
  // @IsOptional()
  // @IsDate()
  // horaSalida:  Date = new Date().toUTCString();

  @IsOptional()
  @IsDate()
  fechaHoraSalida: Date = new Date();

  // @IsNotEmpty()
  // @IsDate()
  // horaLlegada: Date;

  @IsOptional()
  @IsDate()
  fechaHoraLlegada: Date;

  @IsOptional()
  @IsBoolean()
  estado: boolean;

  @IsNotEmpty()
  @IsMongoId()
  usuChoferId: string;

  @IsOptional()
  @IsMongoId()
  usuAyudanteId: string;

  @IsNotEmpty()
  @IsMongoId()
  bus: string;

  @IsNotEmpty()
  @IsMongoId()
  ruta: string;
}

export class ActualizarViajeDto extends PartialType(CrearViajeDto) {}

export class FiltroViajeDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class AgregarAyudanteViajeDto {
  @IsNotEmpty()
  @IsMongoId()
  usuAyudanteId: string;
}
