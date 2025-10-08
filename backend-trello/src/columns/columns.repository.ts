import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Column, ColumnDocument } from './schemas/column.schema';

@Injectable()
export class ColumnsRepository {
  constructor(@InjectModel(Column.name) private columnModel: Model<ColumnDocument>) {}
  
  // Crear una nueva columna
  async create(createColumnDto: CreateColumnDto): Promise<Column> {

    // Obtener el siguiente orden
    const maxOrder = await this.getMaxOrder(createColumnDto.boardId);
    
    const column = new this.columnModel({
      ...createColumnDto,
      order: maxOrder + 1
    });
    return await column.save();
  }
  
  // Buscar columna por ID
  async findById(id: string): Promise<Column | null> {
    if (!isValidObjectId(id)) return null;
    return await this.columnModel.findById(id);
  }
  
  // Buscar todas las columnas de un tablero
  async findByBoardId(boardId: string): Promise<Column[]> {
    return await this.columnModel.find({ boardId }).sort({ order: 1 });
  }
  
  // Actualizar columna
  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column | null> {
    if (!isValidObjectId(id)) return null;
    return await this.columnModel.findByIdAndUpdate(
      id, 
      updateColumnDto, 
      { new: true, runValidators: true }
    );
  }
  
  // Eliminar columna
  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const result = await this.columnModel.findByIdAndDelete(id);
    return !!result;
  }
  
  // Obtener el máximo orden en un tablero
  async getMaxOrder(boardId: string): Promise<number> {
    const result = await this.columnModel.findOne({ boardId }).sort({ order: -1 });
    return result ? result.order : -1;
  }
  
  
  // Actualizar el orden de todas las columnas al mover una columna a una nueva posición
  async updateOrder(id: string, newOrder: number): Promise<Column | null> {
    // Encuentra la columna objetivo
    if (!isValidObjectId(id)) return null;
    const targetColumn = await this.columnModel.findById(id);
    if (!targetColumn) return null;

    const boardId = targetColumn.boardId;
    const oldOrder = targetColumn.order;

    if (oldOrder === newOrder) {
      // No hay cambio de orden
      return targetColumn;
    }

    // Si la columna se mueve hacia abajo (por ejemplo, de 0 a 2)
    if (oldOrder < newOrder) {
      // Disminuir en 1 el orden de las columnas entre oldOrder+1 y newOrder (inclusive)
      await this.columnModel.updateMany(
        {
          boardId,
          order: { $gt: oldOrder, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else {
      // Si la columna se mueve hacia arriba (por ejemplo, de 2 a 0)
      // Aumentar en 1 el orden de las columnas entre newOrder y oldOrder-1 (inclusive)
      await this.columnModel.updateMany(
        {
          boardId,
          order: { $gte: newOrder, $lt: oldOrder }
        },
        { $inc: { order: 1 } }
      );
    }

    // Actualizar el orden de la columna objetivo
    return await this.columnModel.findByIdAndUpdate(
      id,
      { order: newOrder },
      { new: true, runValidators: true }
    );
  }
}
