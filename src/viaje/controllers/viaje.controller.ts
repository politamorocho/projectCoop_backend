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
import {
  CrearViajeDto,
  ActualizarViajeDto,
  FiltroViajeDto,
  AgregarAyudanteViajeDto,
} from '../dtos/viaje.dto';
import { ViajeService } from '../services/viaje.service';

@Controller('viaje')
export class ViajeController {
  constructor(private viajeService: ViajeService) {}

  @Post()
  async crearViaje(@Body() viaje: CrearViajeDto, @Res() response: Response) {
    const data = await this.viajeService.crearViaje(viaje);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'viaje creado',
        data: data,
      });
    }
  }

  @Put('/agrAyudante')
  async agregarAyudante(
    @Body() idAyudante: AgregarAyudanteViajeDto,
    @Query() idViaje: FiltroViajeDto,
    @Res() response: Response,
  ) {
    const data = await this.viajeService.agregarAyudante(idViaje, idAyudante);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Ayudante agregado, viaje actualizado',
        data: data,
      });
    }
  }

  @Get()
  async listar(@Res() response: Response) {
    const data = await this.viajeService.listarTodo();

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes',
        data,
      });
    }
  }

  @Get('/viajeUsuario')
  async buscar(@Res() response: Response, @Query() id: FiltroViajeDto) {
    const data = await this.viajeService.viajePorUsuario(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes del usuario',
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
    @Query() id: FiltroViajeDto,
    @Body() viaje: ActualizarViajeDto,
    @Res() response: Response,
  ) {
    const data = await this.viajeService.actualizar(id, viaje);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Viaje Actualizado',
        data,
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: FiltroViajeDto, @Res() response: Response) {
    const data = await this.viajeService.eliminar(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Viaje eliminado con existo',
      });
    }
  }
}
