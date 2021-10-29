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
} from '../dtos/usuario.dto';
import { UsuarioService } from '../services/usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

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

  @Get('/p')
  async mostrarUno(@Query() id: IdUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.mostrarUno(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Perfil  del usuario',
        data,
      });
    }
  }

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

  @Get('/filtrar')
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
        //msg: 'usuario creado',
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
    @Body() clave: string,
    @Query() id: string,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.verificarClave(clave, id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'clave cambiada con exito',
      });
    } else {
      response.status(HttpStatus.BAD_REQUEST).json({
        msg: 'no se pudo actualizar',
      });
    }
  }

  @Get('/viaje')
  async viajes(@Query() id: IdUsuarioDto, @Res() response: Response) {
    const data = await this.usuarioService.busquedaUsuarioViaje(id);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'lista de viajes del usuario',
        data,
      });
    }
  }
}
