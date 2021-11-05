import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from './usuario.entity';

@Schema()
export class Suspension extends Document {
  @Prop({ required: true })
  inicio: Date;

  @Prop({ required: true })
  final: Date;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  estado: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Usuario.name,
    autopopulate: { select: '-claveUsuario -__v' },
  })
  usuario: Usuario | Types.ObjectId;
}

export const SuspensionSchema = SchemaFactory.createForClass(Suspension);
SuspensionSchema.set('timestamps', true);
SuspensionSchema.methods.toJSON = function () {
  const { __v, ...data } = this.toObject();
  return data;
};
SuspensionSchema.plugin(require('mongoose-autopopulate'));
