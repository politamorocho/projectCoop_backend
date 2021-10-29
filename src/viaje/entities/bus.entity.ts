import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Bus extends Document {
  @Prop({ required: true, unique: true })
  placa: string;

  @Prop({ required: true })
  numeroDisco: string;

  @Prop({ required: true })
  estado: boolean;
}

export const BusSchema = SchemaFactory.createForClass(Bus);
BusSchema.set('timestamps', true);
