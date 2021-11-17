import { SetMetadata } from '@nestjs/common';
import { Rol } from 'src/usuario/entities/rol.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
