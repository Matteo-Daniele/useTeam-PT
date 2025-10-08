import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true, trim: true })
  name: string;
  
  @Prop({ trim: true })
  description?: string;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
