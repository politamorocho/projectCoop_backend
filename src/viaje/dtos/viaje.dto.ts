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
  @IsNotEmpty()
  @IsDate()
  horaSalida: Date;
  @IsNotEmpty()
  @IsDate()
  fechaSalida: Date;

  @IsNotEmpty()
  @IsDate()
  horaLlegada: Date;

  @IsNotEmpty()
  @IsDate()
  fechaLlegada: Date;

  @IsNotEmpty()
  @IsBoolean()
  estado: boolean;

  @IsNotEmpty()
  @IsMongoId()
  usuario_chofer_id: string;

  @IsNotEmpty()
  @IsMongoId()
  usuario_ayudante_id: string;

  @IsNotEmpty()
  @IsMongoId()
  bus: string;

  @IsNotEmpty()
  @IsMongoId()
  ruta: string;
}

export class ActualizarViajeDto extends PartialType(CrearViajeDto) {}

export class FiltroViajeDto {
  @IsOptional()
  @IsString()
  rutaId: string;



}
