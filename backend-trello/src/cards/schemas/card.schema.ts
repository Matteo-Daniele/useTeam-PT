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

// Virtual id legible y exportación de virtuals en JSON/Objeto
CardSchema.virtual('id').get(function (this: any) {
  return this._id ? this._id.toString() : undefined;
});
CardSchema.set('toJSON', { virtuals: true });
CardSchema.set('toObject', { virtuals: true });
