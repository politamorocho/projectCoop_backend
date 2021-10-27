import { Controller, UseGuards, Req, Post, Body } from '@nestjs/common';
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
    const { correo, clave } = login;
    const usuario = await this.authService.validarUsuario(correo, clave);

    return this.authService.generarJWT(usuario);
  }
}
