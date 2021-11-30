import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcrypt';
import { Usuario } from './../../usuario/entities/usuario.entity';
import { UsuarioService } from 'src/usuario/services/usuario.service';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(cedula: string, clave: string) {
    const usuario = await this.usuarioService.existeUsuarioPorCedula(cedula);

    if (usuario) {
      const siClave = await bcryptjs.compare(clave, usuario.claveUsuario);
      if (siClave) {
        //const { claveUsuario, ...resto } = usuario;
        return usuario;
      }
    }

    return null;
  }

  async generarJWT(usuario: Usuario) {
    const payload = { sub: usuario._id, rol: usuario.rol._id };
    return {
      usuario,
      access_token: await this.jwtService.sign(payload),
    };
  }
}
