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
  @IsNotEmpty({ message: 'Debe ingresar una fecha válida' })
  inicio: Date;

  @IsDate()
  @IsNotEmpty({ message: 'Debe ingresar una fecha válida' })
  final: Date;

  @IsNotEmpty({ message: 'Debe ingresar una descripción válida' })
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  estado: boolean;

  @IsMongoId({ message: 'Debe ingresar un usuario válido' })
  @IsNotEmpty({ message: 'Debe ingresar un usuario válido' })
  usuario: string;
}

export class ActualizarSuspensionDto extends PartialType(CrearSuspensionDto) {}

export class FiltroFechaDto {
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
