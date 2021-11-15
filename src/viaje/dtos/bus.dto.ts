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
  @IsString({ message: 'Debe ingresar una placa válida' })
  @IsNotEmpty({ message: 'Debe ingresar una placa válida' })
  placa: string;

  @IsString({ message: 'Debe ingresar un numero válido' })
  @IsNotEmpty({ message: 'Debe ingresar un numero válido' })
  numeroDisco: string;

  @IsOptional()
  estado: boolean;

  // @IsNotEmpty()
  // asientos: number;
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
