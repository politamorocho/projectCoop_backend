import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
//passport local hace la compracion cn la base de datos

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'correo',
      passwordFiel: 'clave',
    });
  }

  async validate(correo: string, clave: string) {
    const usuario = await this.authService.validarUsuario(correo, clave);
    if (!usuario) {
      throw new UnauthorizedException('No está autorizado');
    }
    return usuario;
  }
}
