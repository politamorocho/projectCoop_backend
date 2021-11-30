import {
  Controller,
  Res,
  Get,
  Query,
  HttpStatus,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FiltroViajeDto } from '../dtos/viaje.dto';
import { ViajeService } from '../services/viaje.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SecGuard } from 'src/auth/guards/secretaria.guard';
import { AdmGuard } from 'src/auth/guards/admin.guard';
import { FiltroFechaDto } from '../../usuario/dtos/suspension.dto';

@UseGuards(JwtAuthGuard)
//@UseGuards( SecGuard, AdmGuard)
@Controller('reporte')
export class ReporteViajeController {
  constructor(private viajeService: ViajeService) {}

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

  @Get('/pu')
  async viajesPorUsuario(
    @Res() response: Response,
    @Body() id: FiltroViajeDto,
  ) {
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

  @Get('/pf')
  async viajesPorfecha(
    @Res() response: Response,
    @Body() params: FiltroFechaDto,
  ) {
    const data = await this.viajeService.viajesPorFecha(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes',
        data,
      });
    }
  }
  @Get('/pr')
  async viajesPorRuta(@Res() response: Response, @Body() id: FiltroViajeDto) {
    const data = await this.viajeService.viajesPorRuta(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes',
        data,
      });
    }
  }

  @Get('/puf')
  async viajesPorusuarioFecha(
    @Res() response: Response,
    @Body() id: FiltroViajeDto,
    @Body() params: FiltroFechaDto,
  ) {
    const data = await this.viajeService.viajesPorUsuarioFecha(params, id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes',
        data,
      });
    }
  }

  @Get('/prf')
  async viajesPorRutaFecha(
    @Res() response: Response,
    @Body() id: FiltroViajeDto,
    @Body() params: FiltroFechaDto,
  ) {
    const data = await this.viajeService.viajesPorRutaFecha(params, id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de  viajes',
        data,
      });
    }
  }
}
