import { PartialType } from '@nestjs/mapped-types';
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  IsOptional,
  IsInt,
  Max,
} from 'class-validator';

export class CrearRutaDto {
  @IsNotEmpty()
  @IsString()
  origen: string;

  @IsNotEmpty()
  @IsString()
  destino: string;

  @IsOptional()
  estado: boolean;
}

export class ActualizarRutaDto extends PartialType(CrearRutaDto) {}

export class FiltroRutaDto {
  @IsOptional()
  lugar: string;


  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  estado: number;
}

export class IdRutaDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
