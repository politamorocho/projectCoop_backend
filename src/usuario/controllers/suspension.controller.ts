import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Res,
  Query,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { Response, Request } from 'express';

import {
  CrearSuspensionDto,
  ActualizarSuspensionDto,
  FiltroSuspensionDto,
  IdSuspensionDto,
} from '../dtos/suspension.dto';
import { IdUsuarioDto } from '../dtos/usuario.dto';
import { SuspensionService } from '../services/suspension.service';

@Controller('suspension')
export class SuspensionController {
  constructor(private suspenService: SuspensionService) {}

  @Post()
  async crearSuspension(
    @Body() sus: CrearSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.crearSuspension(sus);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'rol creado con exito',
        data,
      });
    }
  }

  @Get()
  async mostrarTodo(
    @Query() params: FiltroSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.activasPorFecha(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del roles',
        data,
      });
    }
  }

  @Get('/usuario')
  async susPorUsuario(
    @Query() id: IdUsuarioDto,
    @Query() params: FiltroSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.listarPorUsuario(id, params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspensiones del Usuario',
        data,
      });
    }
  }

  @Put()
  async actualizar(
    @Query() id: IdSuspensionDto,
    @Body() susAct: ActualizarSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.actualizar(id, susAct);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspension actualizado con exito',
        data,
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: IdSuspensionDto, @Res() response: Response) {
    const data = await this.suspenService.eliminarSus(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspension eliminado con exito',
        data,
      });
    }
  }
}
