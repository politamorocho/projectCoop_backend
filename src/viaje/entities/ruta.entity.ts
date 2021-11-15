import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Ruta extends Document {
  @Prop({ required: true })
  origen: string;

  @Prop({ required: true })
  destino: string;

  @Prop({ default: true, required: true })
  estado: boolean;

  @Prop()
  duracionAprox: string;
}

export const RutaSchema = SchemaFactory.createForClass(Ruta);
RutaSchema.set('timestamps', true);
