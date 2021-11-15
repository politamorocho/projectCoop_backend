import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
//passport local hace la compracion cn la base de datos

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'cedula',
      passwordField: 'clave',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const usuario = await this.authService.validarUsuario(username, password);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return usuario;
  }
}
