import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Rol } from './rol.entity';

@Schema()
export class Usuario extends Document {
  @Prop({})
  nombre: string;

  @Prop({})
  apellido: string;

  @Prop({ unique: true })
  correo: string;

  @Prop({})
  cedula: string;

  @Prop({})
  claveUsuario: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Rol.name,
    autopopulate: { select: '_id nombre estado descripcion' },
  })
  rol: Rol | Types.ObjectId;

  @Prop({ default: true })
  estado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.set('timestamps', true);
UsuarioSchema.plugin(require('mongoose-autopopulate'));
UsuarioSchema.methods.toJSON = function () {
  const { __v, claveUsuario, ...data } = this.toObject();
  return data;
};
