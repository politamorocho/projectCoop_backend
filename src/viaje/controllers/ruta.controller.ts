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
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RutaService } from '../services/ruta.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SecGuard } from 'src/auth/guards/secretaria.guard';
import {
  CrearRutaDto,
  ActualizarRutaDto,
  FiltroRutaDto,
  IdRutaDto,
} from '../dtos/ruta.dto';

//@UseGuards(JwtAuthGuard, SecGuard)
@Controller('ruta')
export class RutaController {
  constructor(private rutaService: RutaService) {}

  @Post()
  async crearRuta(@Body() ruta: CrearRutaDto, @Res() response: Response) {
    const data = await this.rutaService.crearRuta(ruta);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'bus creado',
        data: data,
      });
    }
  }

  @Get()
  async mostrarTodo(@Res() response: Response) {
    const data = await this.rutaService.mostrarTodo();

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  rutas',
        data,
      });
    }
  }

  @Get('/activos')
  async soloActivos(@Res() response: Response) {
    const data = await this.rutaService.soloActivos();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de rutas activas',
        data,
      });
    }
  }

  @Get('/p')
  async mostrarUno(@Query() id: IdRutaDto, @Res() response: Response) {
    const data = await this.rutaService.mostrarUno(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  rutas',
        data,
      });
    }
  }

  @Get('/filtro')
  async filtrarActivaInactiva(
    @Res() response: Response,
    @Query() params: FiltroRutaDto,
  ) {
    const data = await this.rutaService.filtrarActivaInactiva(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  rutas',
        data,
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
        msg: 'Ruta eliminado con exito',
      });
    }
  }
}
