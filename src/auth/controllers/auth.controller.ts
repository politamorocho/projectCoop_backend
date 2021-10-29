import {
  Controller,
  UseGuards,
  Req,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //@UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() login: LoginDto) {
    console.log(login, 'logins');
    const { cedula, clave } = login;
    const usuario = await this.authService.validarUsuario(cedula, clave);
    if (!usuario) {
      return new UnauthorizedException('no señor');
    }

    return this.authService.generarJWT(usuario);
  }
  //  login(@Req() req: Request) {
  //   const user = req.user as Usuario;
  //   console.log(user);
  //   return this.authService.generarJWT(user);
  // }
}
