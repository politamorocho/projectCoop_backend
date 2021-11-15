import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from './../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    //si espublico da permiso
    const isPublic = this.reflector.get(
      IS_PUBLIC_KEY,
      context.getHandler(),
     
    );
    if (isPublic) {
      return true;
    }

    //si no es publico
    //si no viene la metadata, que haga lo que hereda
    return super.canActivate(context);
  }
}
