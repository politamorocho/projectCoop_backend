import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsInt,
  Max,
} from 'class-validator';

export class CrearBusDto {
  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsString()
  @IsNotEmpty()
  numeroDisco: string;

  @IsNotEmpty()
  estado: boolean;
}

export class ActualizarBusDto extends PartialType(CrearBusDto) {}

export class FiltroBusDto {
  @IsOptional()
  placa: string;

  @IsOptional()
  numeroDisco: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  estado: number;
}

export class IdBusDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
