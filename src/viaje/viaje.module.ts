import { Module } from '@nestjs/common';
import { ViajeController } from './controllers/viaje.controller';
import { RutaController } from './controllers/ruta.controller';
import { BusController } from './controllers/bus.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bus, BusSchema } from './entities/bus.entity';
import { Ruta, RutaSchema } from './entities/ruta.entity';
import { Viaje, ViajeSchema } from './entities/viaje.entity';
import { ViajeService } from './services/viaje.service';
import { RutaService } from './services/ruta.service';
import { BusService } from './services/bus.service';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { ReporteViajeController } from './controllers/reporte.viaje.controller';

@Module({
  imports: [
    UsuarioModule,
    MongooseModule.forFeature([
      { name: Bus.name, schema: BusSchema },
      { name: Ruta.name, schema: RutaSchema },
      { name: Viaje.name, schema: ViajeSchema },
    ]),
  ],
  controllers: [
    ViajeController,
    RutaController,
    BusController,
    ReporteViajeController,
  ],
  providers: [ViajeService, RutaService, BusService],
})
export class ViajeModule {}
