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
  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsString({ message: 'Debe ingresar lugar de origen para la ruta válido' })
  origen: string;

  @IsNotEmpty({ message: 'El campo no puede estar vacío' })
  @IsString({ message: 'Debe ingresar lugar de destino para la ruta válido' })
  destino: string;

  @IsOptional()
  estado: boolean;

  @IsNotEmpty({
    message: 'Debe ingresar una duración aproximada para la ruta válida',
  })
  duracionAprox: string;
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
