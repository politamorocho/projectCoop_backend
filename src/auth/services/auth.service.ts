import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcrypt';
import { Usuario } from 'src/usuario/entities/usuario.entity';
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
    // console.log(usuario, 'es usuario');

    // if (!usuario) {
    //   return new UnauthorizedException('no coinciden las credenciales');
    // }

    if (usuario) {
      const siClave = await bcryptjs.compare(clave, usuario.claveUsuario);
      if (siClave) {
        const { claveUsuario, ...resto } = usuario.toJSON();
        return usuario;
      }
    }

    return null;
  }

  generarJWT(usuario: Usuario) {
    const payload = { sub: usuario._id, rol: usuario.rol };
    return {
      access_token: this.jwtService.sign(payload),
      usuario,
    };
  }
}
