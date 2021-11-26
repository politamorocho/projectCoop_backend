import {
  Controller,
  Get,
  Query,
  Res,
  Param,
  Body,
  Post,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ActualizarRolDto,
  CrearRolDto,
  FiltroRolDto,
  IdRolDto,
} from '../dtos/rol.dto';

import { RolService } from '../services/rol.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SecGuard } from 'src/auth/guards/secretaria.guard';

//@UseGuards(JwtAuthGuard, SecGuard)
@Controller('rol')
export class RolController {
  constructor(private rolService: RolService) {}

  //muestra todos los roles en db
  @Get()
  async todo(@Res() response: Response) {
    const data = await this.rolService.todos();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del roles',
        data,
      });
    }
  }

  //solo roles activos
  @Get('/a')
  async soloActivos(@Res() response: Response) {
    const data = await this.rolService.soloActivos();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del roles activos',
        data,
      });
    }
  }

  //filtra roles por activos=1 o inactivos=0 enviado por query
  @Get('/f')
  async filtroActivoInactivo(
    @Query() query: FiltroRolDto,
    @Res() response: Response,
  ) {
    const data = await this.rolService.filtroActivoInactivo(query);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del roles',
        data,
      });
    }
  }

  //info de un rol buscado por id enviado por query
  @Get('/p')
  async mostrarUno(@Query() id: IdRolDto, @Res() response: Response) {
    const data = await this.rolService.mostrarUno(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Informacion del rol',
        data,
      });
    }
  }

  //buscar roles por nombre
  @Get('/b')
  async buscar(@Query() buscar: FiltroRolDto, @Res() response: Response) {
    const data = await this.rolService.buscar(buscar);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Roles que coinciden',
        data,
      });
    }
  }

  //crea un rol nuevo
  @Post()
  async crearRol(@Body() rol: CrearRolDto, @Res() response: Response) {
    const data = await this.rolService.crearRol(rol);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'rol creado con exito',
        data,
      });
    }
  }

  //actualiza un rol seleccinado por id, enviado por query
  @Put()
  async actualizar(
    @Query() id: IdRolDto,
    @Body() usAct: ActualizarRolDto,
    @Res() response: Response,
  ) {
    const data = await this.rolService.actualizar(id, usAct);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Rol actualizado con exito',
        data,
      });
    }
  }

  @Put('/h')
  async habilitar(@Query() id: IdRolDto, @Res() response: Response) {
    const data = await this.rolService.habilitar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Rol habilitado con exito',
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: IdRolDto, @Res() response: Response) {
    const data = await this.rolService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Rol eliminado con exito',
      });
    }
  }
}
