import { Module } from '@nestjs/common';
import { UsuarioController } from './controllers/usuario.controller';
import { RolController } from './controllers/rol.controller';
import { SuspensionController } from './controllers/suspension.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { Rol, RolSchema } from './entities/rol.entity';
import { Suspension, SuspensionSchema } from './entities/suspension.entity';
import { UsuarioService } from './services/usuario.service';
import { RolService } from './services/rol.service';
import { SuspensionService } from './services/suspension.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Rol.name, schema: RolSchema },
      { name: Suspension.name, schema: SuspensionSchema },
    ]),
  ],

  controllers: [UsuarioController, RolController, SuspensionController],

  providers: [UsuarioService, RolService, SuspensionService],
  exports: [UsuarioService, RolService, SuspensionService, MongooseModule],
})
export class UsuarioModule {}
