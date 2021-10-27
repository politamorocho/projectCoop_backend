import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CrearSuspensionDto {
  @IsDate()
  @IsNotEmpty()
  inicio: Date;

  @IsDate()
  @IsNotEmpty()
  final: Date;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNotEmpty()
  @IsBoolean()
  estado: boolean;

  @IsMongoId()
  @IsNotEmpty()
  usuario: string;
}

export class ActualizarSuspensionDto extends PartialType(CrearSuspensionDto) {}

export class FiltroSuspensionDto {
  @IsOptional()
  @IsInt()
  estado: number;

  @IsOptional()
  @IsDate()
  desde: Date;

  @ValidateIf((params) => params.desde)
  @IsDate()
  hasta: Date;
}
export class IdSuspensionDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
