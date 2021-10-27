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
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ActualizarRolDto,
  CrearRolDto,
  FiltroRolDto,
  IdRolDto,
} from '../dtos/rol.dto';

import { RolService } from '../services/rol.service';

@Controller('rol')
export class RolController {
  constructor(private rolService: RolService) {}

  @Get()
  async mostrarTodo(@Query() params: FiltroRolDto, @Res() response: Response) {
    const data = await this.rolService.mostrarTodo(params);

    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Lista  del roles',
        data,
      });
    }
  }

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

  @Delete()
  async eliminar(@Query() id: IdRolDto, @Res() response: Response) {
    const data = await this.rolService.eliminar(id);
    if (data) {
      response.status(HttpStatus.OK).json({
        msg: 'Rol eliminado con exito',
        data,
      });
    }
  }
}
