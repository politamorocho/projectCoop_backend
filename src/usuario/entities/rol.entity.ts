import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Rol extends Document {
  @Prop({ unique: true })
  nombre: string;

  @Prop({})
  descripcion: string;

  @Prop({})
  estado: boolean;
}

export const RolSchema = SchemaFactory.createForClass(Rol);
RolSchema.set('timestamps', true);
