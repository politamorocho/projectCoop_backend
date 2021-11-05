import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Rol extends Document {
  @Prop({ unique: true, require: true })
  nombre: string;

  @Prop({ require: true })
  descripcion: string;

  @Prop({ default: true, require: true })
  estado: boolean;
}

export const RolSchema = SchemaFactory.createForClass(Rol);
RolSchema.set('timestamps', true);
