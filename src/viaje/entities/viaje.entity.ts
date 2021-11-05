import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Bus } from './bus.entity';
import { Ruta } from './ruta.entity';

@Schema()
export class Viaje extends Document {
  // @Prop({ type: Date, require: true })
  // horaSalida: Date;

  @Prop({ type: Date, default: new Date(), require: true })
  fechaHoraSalida: Date = new Date();

  // @Prop({ type: Date, require: true })
  // horaLlegada: Date;

  @Prop({ type: Date, require: true })
  fechaHoraLlegada: Date;

  @Prop({ default: true, require: true })
  estado: boolean;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: true,
  })
  usuChoferId: Usuario | Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: true,
  })
  usuAyudanteId: Usuario | Types.ObjectId;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Bus.name,
    autopopulate: true,
  })
  bus: Bus | Types.ObjectId;

  @Prop({
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Ruta.name,
    autopopulate: true,
  })
  ruta: Ruta | Types.ObjectId;
}

export const ViajeSchema = SchemaFactory.createForClass(Viaje);
ViajeSchema.set('timestamps', true);
ViajeSchema.plugin(require('mongoose-autopopulate'));
