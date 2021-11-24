import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Bus } from './bus.entity';
import { Ruta } from './ruta.entity';
import { Suspension } from 'src/usuario/entities/suspension.entity';

@Schema()
export class Viaje extends Document {
  // @Prop({ type: Date, require: true })
  // horaSalida: Date;

  @Prop({ type: Date, default: new Date(), require: true })
  fechaHoraSalida: Date;

  @Prop({ type: Date })
  fechaHoraLlegadaAprox: Date;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: {
      select:
        ' -claveUsuario -__v -rol -codigoRecuperacion -codigoRecuperacionExpira -tipo',
    },
  })
  empleado1: Usuario | Types.ObjectId;

  @Prop()
  tipoEmpleado1: string;

  @Prop({
    require: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: {
      select:
        ' -claveUsuario -__v -rol -codigoRecuperacion -codigoRecuperacionExpira -tipo',
    },
  })
  empleado2: string | Usuario | Types.ObjectId;

  @Prop()
  tipoEmpleado2: string;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Bus.name,
    autopopulate: { select: '_id placa numeroDisco estado' },
  })
  bus: Bus | Types.ObjectId;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Ruta.name,
    autopopulate: { select: '_id origen destino estado duracionAprox' },
  })
  ruta: Ruta | Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId }],
    ref: Suspension.name,
    autopopulate: { select: '_id inicio final descripcion' },
  })
  suspensionActiva: Types.Array<Suspension>;
}

export const ViajeSchema = SchemaFactory.createForClass(Viaje);
ViajeSchema.set('timestamps', true);
ViajeSchema.plugin(require('mongoose-autopopulate'));
