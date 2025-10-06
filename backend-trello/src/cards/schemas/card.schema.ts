import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true, trim: true })
  title: string;
  
  @Prop({ trim: true })
  description?: string;
  
  @Prop({ required: true })
  boardId: string;
  
  @Prop({ required: true })
  columnId: string;
  
  @Prop({ required: true, default: 0 })
  order: number;
  
  @Prop({ required: true })
  userId: string;

  // Add id as a virtual property for convenience
  get _id(): string {
    // @ts-ignore
    return this._id?.toString();
  }

  // createdAt and updatedAt will be added by Mongoose with timestamps: true
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CardSchema = SchemaFactory.createForClass(Card);

// Índices para optimizar consultas
CardSchema.index({ boardId: 1, columnId: 1, order: 1 });
CardSchema.index({ boardId: 1 });
CardSchema.index({ columnId: 1 });
CardSchema.index({ createdAt: -1 });
