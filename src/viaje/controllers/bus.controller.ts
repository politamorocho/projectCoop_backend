import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Res,
  Req,
  Query,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CrearBusDto,
  ActualizarBusDto,
  FiltroBusDto,
  IdBusDto,
} from '../dtos/bus.dto';
import { BusService } from '../services/bus.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SecGuard } from 'src/auth/guards/secretaria.guard';

//@UseGuards(JwtAuthGuard, SecGuard)
@Controller('bus')
export class BusController {
  constructor(private busService: BusService) {}

  @Post()
  async crearBus(@Body() bus: CrearBusDto, @Res() response: Response) {
    const data = await this.busService.crearBus(bus);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'bus creado',
        data: data,
      });
    }
  }

  @Get()
  async mostrarTodo(@Res() response: Response) {
    const data = await this.busService.mostrarTodo();

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del buses',
        data,
      });
    }
  }

  @Get('/activos')
  async soloActivos(@Res() response: Response) {
    const data = await this.busService.soloActivos();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de buses activos',
        data,
      });
    }
  }

  @Get('/p')
  async mostrarUno(@Query() id: IdBusDto, @Res() response: Response) {
    const data = await this.busService.mostrarUno(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Informacion del bus',
        data,
      });
    }
  }

  @Get('/filtro')
  async listar(@Res() response: Response, @Query() params: FiltroBusDto) {
    const data = await this.busService.listar(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del buses',
        data,
      });
    }
  }

  @Get('/buscar')
  async buscar(@Res() response: Response, @Query() params: FiltroBusDto) {
    const data = await this.busService.buscarPorPlacaONumero(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del buses',
        data,
      });
    }
  }

  @Put()
  async actualizar(
    @Query() id: IdBusDto,
    @Body() busAct: ActualizarBusDto,
    @Res() response: Response,
  ) {
    const data = await this.busService.actualizar(id, busAct);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Bus actualizado con exito',
        data,
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: IdBusDto, @Res() response: Response) {
    const data = await this.busService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Bus eliminado con exito',
      });
    }
  }
}
