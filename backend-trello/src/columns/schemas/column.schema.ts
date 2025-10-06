import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true, trim: true })
  name: string;
  @Prop({ required: true })
  boardId: string;
  @Prop({ required: true, default: 0 })
  order: number;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

// Índices para optimizar consultas
ColumnSchema.index({ boardId: 1, order: 1 });
ColumnSchema.index({ boardId: 1 });
