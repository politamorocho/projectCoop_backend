import {
  Controller,
  UseGuards,
  Req,
  Post,
  Body,
  Request,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    const user = req.user as Usuario;

    return this.authService.generarJWT(user);
  }

  // async login(@Req() login: Request) {
  //   console.log(login, 'logins');

  //   const usuario = await this.authService.validarUsuario(cedula, clave);

  //   return this.authService.generarJWT(usuario);
  // }
}
