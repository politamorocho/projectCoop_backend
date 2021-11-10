import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Rol } from './rol.entity';
import { TipoEmpleado } from '../models/usuario.tipo.model';

@Schema()
export class Usuario extends Document {
  @Prop()
  nombre: string;

  @Prop()
  apellido: string;

  @Prop()
  correo: string;

  @Prop()
  cedula: string;

  @Prop()
  claveUsuario: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Rol.name,
    autopopulate: { select: '_id nombre estado descripcion' },
  })
  rol: Rol | Types.ObjectId;

  @Prop()
  tipo: TipoEmpleado;

  @Prop({ default: true })
  estado: boolean;

  @Prop()
  codigoRecuperacion: string;

  @Prop()
  codigoRecuperacionExpira: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.set('timestamps', true);
UsuarioSchema.plugin(require('mongoose-autopopulate'));
UsuarioSchema.methods.toJSON = function () {
  const {
    __v,
    claveUsuario,
    codigoRecuperacion,
    codigoRecuperacionExpira,
    ...data
  } = this.toObject();
  return data;
};
