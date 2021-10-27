import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  HttpStatus,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RutaService } from '../services/ruta.service';
import {
  CrearRutaDto,
  ActualizarRutaDto,
  FiltroRutaDto,
  IdRutaDto,
} from '../dtos/ruta.dto';

@Controller('ruta')
export class RutaController {
  constructor(private rutaService: RutaService) {}

  @Post()
  async crearRuta(@Body() bus: CrearRutaDto, @Res() response: Response) {
    const data = await this.rutaService.crearRuta(bus);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'bus creado',
        data: data,
      });
    }
  }

  @Get()
  async listar(@Res() response: Response, @Query() params?: FiltroRutaDto) {
    const data = await this.rutaService.listar(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  rutas',
        data,
      });
    } else {
      response.status(HttpStatus.BAD_REQUEST).json({
        msg: 'no rutas',
      });
    }
  }

  @Get('/buscar')
  async buscar(@Res() response: Response, @Query() params: FiltroRutaDto) {
    const data = await this.rutaService.buscarPorOrigenODestino(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  rutas',
        data,
      });
    } else {
      response.status(HttpStatus.BAD_REQUEST).json({
        msg: 'no rutas',
      });
    }
  }

  @Put()
  async actualizar(
    @Query() id: IdRutaDto,
    @Body() busAct: ActualizarRutaDto,
    @Res() response: Response,
  ) {
    const data = await this.rutaService.actualizar(id, busAct);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Ruta actualizada con exito',
        data,
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: IdRutaDto, @Res() response: Response) {
    const data = await this.rutaService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'bus eliminado con exito',
        data,
      });
    }
  }
}
