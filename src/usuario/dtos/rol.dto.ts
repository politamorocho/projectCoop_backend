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
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsBoolean()
  @IsNotEmpty()
  estado: boolean;
}

export class ActualizarRolDto extends PartialType(CrearRolDto) {}

export class FiltroRolDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  estado: number;
}

export class IdRolDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
