import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Ruta } from './ruta.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Bus } from './bus.entity';

export class Viaje extends Document {
  @Prop({ required: true })
  horaSalida: Date;

  @Prop({ required: true })
  fechaSalida: Date;

  @Prop({ required: true })
  horaLlegada: Date;

  @Prop({ required: true })
  fechaLlegada: Date;

  @Prop({ required: true })
  estado: boolean;

  @Prop({ type: Types.ObjectId, ref: Usuario.name })
  usuario_chofer_id: Usuario | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name })
  usuario_ayudante_id: Usuario | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Bus.name })
  bus: Bus | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Ruta.name })
  ruta: Ruta | Types.ObjectId;
}

export const ViajeSchema = SchemaFactory.createForClass(Viaje);
ViajeSchema.set('timestamps', true);
