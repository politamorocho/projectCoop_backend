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
} from '@nestjs/common';
import { Response } from 'express';
import {
  CrearBusDto,
  ActualizarBusDto,
  FiltroBusDto,
  IdBusDto,
} from '../dtos/bus.dto';
import { BusService } from '../services/bus.service';

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
  async listar(@Res() response: Response, @Query() params?: FiltroBusDto) {
    const data = await this.busService.listar(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del buses',
        data,
      });
    } else {
      response.status(HttpStatus.BAD_REQUEST).json({
        msg: 'no existen buses',
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
        msg: 'bus eliminado con exito',
        data,
      });
    }
  }
}
