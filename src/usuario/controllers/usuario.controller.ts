import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

import {
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  FiltroUsuarioDto,
  IdUsuarioDto,
  CambiarClaveDto,
} from '../dtos/usuario.dto';
import { UsuarioService } from '../services/usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  //info de todos los usuarios activos e inactivos
  @Get()
  async mostrarTodo(@Res() response: Response) {
    const data = await this.usuarioService.mostrarTodo();

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del usuarios',
        data,
      });
    }
  }

  //info de un usuario activo buscado por id enviado por query
  @Get('/p')
  async mostrarUno(@Query() id: IdUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.mostrarUno(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Perfil  del usuario',
        data,
      });
    } else {
      response.status(HttpStatus.OK).json({
        msg: 'No se puede acceder al perfil del usuario',
      });
    }
  }

  //busca usuarios por coincidencias de nombres o apellidos o cedula
  //enviados por query
  @Get('/buscar')
  async busqueda(@Query() params: FiltroUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.busqueda(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'lista de usuarios',
        data,
      });
    }
  }

  //filtra usuarios por activos=1 o inactivos=0 enviado por query
  @Get('/filtro')
  async filtrar(@Query() params: FiltroUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.filtroActivoInactivo(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'lista de usuarios',
        data,
      });
    }
  }

  @Post()
  async crearUsuario(
    @Body() usuario: CrearUsuarioDto,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.crearUsuario(usuario);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'usuario creado',
        data: data,
      });
    }
  }

  @Put()
  async actualizar(
    @Query() id: IdUsuarioDto,
    @Body() usAct: ActualizarUsuarioDto,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.actualizar(id, usAct);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Usuario actualizado con exito',
        data,
      });
    }
  }

  @Delete()
  async eliminar(@Query() id: IdUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Usuario eliminado con exito',
      });
    }
  }

  @Put('/actClave')
  async actualizarClave(
    @Query() idUs: IdUsuarioDto,
    @Body() cambios: CambiarClaveDto,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.verificarClave(idUs, cambios);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'clave cambiada con exito',
      });
    }
  }
}
