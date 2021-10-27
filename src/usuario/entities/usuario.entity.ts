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

  @Prop({ unique: true })
  cedula: string;

  @Prop({})
  claveUsuario: string;

  @Prop({ type: Types.ObjectId, ref: Rol.name })
  rol: Rol | Types.ObjectId;

  @Prop({})
  estado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.set('timestamps', true);
UsuarioSchema.methods.toJSON = function () {
  const { __v, claveUsuario, ...data } = this.toObject();
  return data;
};
