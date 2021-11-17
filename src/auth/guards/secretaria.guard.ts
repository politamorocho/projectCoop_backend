import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; //reflector obtiene metadata
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Rol } from 'src/usuario/entities/rol.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class SecGuard implements CanActivate {
  constructor(
    @InjectModel(Rol.name) private rolModel: Model<Rol>,
    private reflector: Reflector,
  ) {}

  async verCual(id: string): Promise<string> {
    const dat = await this.rolModel.findById({ _id: id });
    const nombre = dat.nombre;

    // if (!nombre) {
    //   return false;
    // }
    return nombre;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    // if (!roles) {
    //   return true;
    // }

    const request = context.switchToHttp().getRequest();
    const user = request.user as PayloadToken;
    //console.log(user);

    const ver = user.rol;
    const rolAuth = await this.verCual(ver);

    if (!rolAuth) {
      throw new UnauthorizedException('El usuario no tiene un rol autorizado');
    }
    //console.log(roli.toString(), 'el rolisss');

    if (rolAuth.toString() !== process.env.ROL_CORREO_2) {
      throw new UnauthorizedException('El usuario no tiene un rol autorizado');
    }
    return true;

    // const isAuth = roles.some((role) => role === user.rol);

    // if (!isAuth) {
    //   throw new UnauthorizedException('not role  authorized');
    // }
    // if (!roli) {
    //   throw new UnauthorizedException('not role  authorized');
    // }

    // if (roli !== process.env.ROL_CORREO_2) {
    //   throw new UnauthorizedException('not role  authorized');
    // }

    // if (isAuth && roli) {
    //   console.log('roliii', roli);
    //return true;
    // }
  }
}
