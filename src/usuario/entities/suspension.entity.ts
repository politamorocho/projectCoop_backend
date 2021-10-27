import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from './usuario.entity';

export class Suspension extends Document {
  @Prop({ required: true })
  inicio: Date;

  @Prop({ required: true })
  final: Date;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  estado: boolean;

  @Prop({ type: Types.ObjectId, ref: Usuario.name })
  usuario: Usuario | Types.ObjectId;
}

export const SuspensionSchema = SchemaFactory.createForClass(Suspension);
SuspensionSchema.set('timestamps', true);
