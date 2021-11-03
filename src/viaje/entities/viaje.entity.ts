import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Bus } from './bus.entity';
import { Ruta } from './ruta.entity';

@Schema()
export class Viaje extends Document {
  @Prop({ type: Date, require: true })
  horaSalida: Date;

  @Prop({ type: Date, require: true })
  fechaSalida: Date;

  @Prop({ type: Date, require: true })
  horaLlegada: Date;

  @Prop({ type: Date, require: true })
  fechaLlegada: Date;

  @Prop({ type: Boolean, require: true })
  estado: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: true,
  })
  usuChoferId: Usuario;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: true,
  })
  usuAyudanteId: Usuario;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Bus.name,
    autopopulate: true,
  })
  bus: Bus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Ruta.name,
    autopopulate: true,
  })
  ruta: Ruta;
}

export const ViajeSchema = SchemaFactory.createForClass(Viaje);
ViajeSchema.set('timestamps', true);
ViajeSchema.plugin(require('mongoose-autopopulate'));
