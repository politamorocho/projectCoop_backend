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

  //crea un suspension
  @Post()
  async crearSuspension(
    @Body() sus: CrearSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.crearSuspension(sus);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'suspension creado con exito',
        data,
      });
    }
  }

  //todas las suspensiones en db
  @Get()
  async mostrarTodas(@Res() response: Response) {
    const data = await this.suspenService.mostrarTodas();

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del suspensiones',
        data,
      });
    }
  }

  //filtra suspensiones activas=1 o inactivas=0 por estado enviadopor  query
  @Get('/filtro')
  async filtroActivaInactiva(
    @Query() query: FiltroSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.filtroActivaInactiva(query);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del suspensiones',
        data,
      });
    }
  }

  //la informacion de una suspension por id enviado por query
  @Get('/p')
  async mostrarUna(@Query() id: IdSuspensionDto, @Res() response: Response) {
    const data = await this.suspenService.mostrarUna(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Informacion de la suspension',
        data,
      });
    }
  }

  //todas las suspensiones del usuario por id enviado por query
  @Get('/usuario')
  async susPorUsuario(@Query() id: IdUsuarioDto, @Res() response: Response) {
    const data = await this.suspenService.susPorUsuario(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspensiones del Usuario',
        data,
      });
    } else {
      response.status(HttpStatus.OK).json({
        msg: 'No hay suspensiones para ese usuario',
      });
    }
  }

  //todas las suspensiones del usuario por id filtradas por activas=1 o inactivas=0 enviado por query
  @Get('/usFiltro')
  async filtroActivaInactivaPorUsuario(
    @Query() id: IdUsuarioDto,
    @Query() params: FiltroSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.filtroActivaInactivaPorUsuario(
      id,
      params,
    );

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspensiones del Usuario',
        data,
      });
    }
  }

  //Muestra las suspensiones de un usuario por id, en rango  por fecha de creacioon
  @Get('/usFecha')
  async susPorUsuarioFecha(
    @Query() id: IdUsuarioDto,
    @Query() params: FiltroSuspensionDto,
    @Res() response: Response,
  ) {
    const data = await this.suspenService.susPorUsuarioFecha(id, params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspensiones del Usuario',
        data,
      });
    }
  }

  //actualizar suspensionpor id enviado por query
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

  //eliminar suspension por id enviado en query
  @Delete()
  async eliminar(@Query() id: IdSuspensionDto, @Res() response: Response) {
    const data = await this.suspenService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Suspension eliminado con exito',
      });
    }
  }
}
