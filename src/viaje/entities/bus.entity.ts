import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Bus extends Document {
  @Prop({ required: true, unique: true })
  placa: string;

  @Prop({ required: true })
  numeroDisco: string;

  @Prop({ default: true, required: true })
  estado: boolean;
}

export const BusSchema = SchemaFactory.createForClass(Bus);
BusSchema.set('timestamps', true);
