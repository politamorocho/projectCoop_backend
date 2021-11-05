import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class CrearRolDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsBoolean()
  estado: boolean;
}

export class ActualizarRolDto extends PartialType(CrearRolDto) {}

export class FiltroRolDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  estado: number;

  @IsOptional()
  @IsString()
  busqueda: string;
}

export class IdRolDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
