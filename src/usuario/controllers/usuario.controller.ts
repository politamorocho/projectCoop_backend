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
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import {
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  FiltroUsuarioDto,
  IdDto,
  CambiarClaveDto,
  RecuperarClaveDto,
  FijarNuevaClaveDto,
} from '../dtos/usuario.dto';
import { UsuarioService } from '../services/usuario.service';

//@UseGuards(JwtAuthGuard)
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

  @Get('/activos')
  async soloActivos(@Res() response: Response) {
    const data = await this.usuarioService.soloActivos();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del usuarios activos',
        data,
      });
    }
  }

  //empleados activos
  @Get('/empActivo')
  async empleadoActivo(@Res() response: Response) {
    const data = await this.usuarioService.empleadoActivo();
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  de empleados activos',
        data,
      });
    }
  }

  //info de un usuario activo buscado por id enviado por query
  @Get('/p')
  async mostrarUno(@Query() id: IdDto, @Res() response: Response) {
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
    @Query() id: IdDto,
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
  async eliminar(@Query() id: IdDto, @Res() response: Response) {
    const data = await this.usuarioService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Usuario eliminado con exito',
      });
    }
  }

  @Put('/actClave')
  async actualizarClave(
    @Query() idUs: IdDto,
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

  //envia el codigo de verifiacion de segurirdad para fijar nueva clave
  @Post('/enviarCodigo')
  async enviarCodigoRecuperacion(
    @Body() correo: RecuperarClaveDto,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.enviarCorreoRecuperarClave(correo);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'clave enviada a su correo, tiene 15 minutos para ingresarlo',
      });
    }
  }

  //con el codigo enviado se fija una nueva clave
  @Put('/nuevaClave')
  async asignarNuevaClave(
    @Body() info: FijarNuevaClaveDto,
    @Res() response: Response,
  ) {
    const data = await this.usuarioService.asignarNuevaClave(info);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Clave cambiada con exito',
      });
    }
  }
}
