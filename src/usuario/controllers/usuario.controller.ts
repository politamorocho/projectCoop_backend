import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Request,
  Param,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SecGuard } from 'src/auth/guards/secretaria.guard';

import {
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  FiltroUsuarioDto,
  IdDto,
  CambiarClaveDto,
  RecuperarClaveDto,
  FijarNuevaClaveDto,
} from '../dtos/usuario.dto';
import { RolService } from '../services/rol.service';
import { UsuarioService } from '../services/usuario.service';

import { PayloadToken } from './../../auth/models/token.model';
import { Rol } from '../entities/rol.entity';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@UseGuards(JwtAuthGuard)
//@UseGuards( SecGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(
    @InjectModel(Rol.name) private rolModel: Model<Rol>,
    private usuarioService: UsuarioService,
    private rolService: RolService,
  ) {}

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

  @Get('/a')
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

  @Get('/ea')
  async empleadoActivo(@Res() response: Response) {
    // const user = req.user as PayloadToken;
    // console.log('Es el user', user);
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
  @Get('/b')
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
  @Get('/f')
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

  @Delete()
  async eliminar(@Query() id: IdDto, @Res() response: Response) {
    const data = await this.usuarioService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Usuario eliminado con exito',
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

  @Put('/h')
  async habilitar(@Query() id: IdDto, @Res() response: Response) {
    const data = await this.usuarioService.habilitar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Usuario habilitado con exito',
      });
    }
  }

  @Put('/ac')
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

  //envia el codigo de verificacion de segurirdad para fijar nueva clave
  @Post('/ec')
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
  @Put('/nc')
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
