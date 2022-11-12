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
import {
  CrearViajeDto,
  ActualizarViajeDto,
  FiltroViajeDto,
  AgregarEmpleado2Dto,
} from '../dtos/viaje.dto';
import { ViajeService } from '../services/viaje.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

//@UseGuards(JwtAuthGuard)
//@UseGuards( SecGuard)
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

  @Put('/ayu')
  async agregarEmpleado2(
    @Body() idAyudante: AgregarEmpleado2Dto,
    @Query() idViaje: FiltroViajeDto,
    @Res() response: Response,
  ) {
    const data = await this.viajeService.agregarEmpleado2(idViaje, idAyudante);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Ayudante agregado, viaje actualizado',
        data: data,
      });
    }
  }

  @Get('/p')
  async mostraUno(@Query() idViaje: FiltroViajeDto, @Res() response: Response) {
    const data = await this.viajeService.listarUno(idViaje);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Informacion del viaje',
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

  // @Put()
  // async actualizar(
  //   @Query() id: FiltroViajeDto,
  //   @Body() viaje: ActualizarViajeDto,
  //   @Res() response: Response,
  // ) {
  //   const data = await this.viajeService.actualizar(id, viaje);

  //   if (data) {
  //     response.status(HttpStatus.OK).json({
  //       msg: 'Viaje Actualizado',
  //       data,
  //     });
  //   }
  // }

  // @Delete()
  // async eliminar(@Query() id: FiltroViajeDto, @Res() response: Response) {
  //   const data = await this.viajeService.eliminar(id);

  //   if (data) {
  //     response.status(HttpStatus.OK).json({
  //       msg: 'Viaje eliminado con éxito',
  //       data,
  //     });
  //   }
  // }
}
