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
import { CrearViajeDto, FiltroViajeDto } from '../dtos/viaje.dto';
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
}
