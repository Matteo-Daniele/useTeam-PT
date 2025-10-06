import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    return await this.columnModel.findById(id);
  }
  
  // Buscar todas las columnas de un tablero
  async findByBoardId(boardId: string): Promise<Column[]> {
    return await this.columnModel.find({ boardId }).sort({ order: 1 });
  }
  
  // Actualizar columna
  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column | null> {
    return await this.columnModel.findByIdAndUpdate(
      id, 
      updateColumnDto, 
      { new: true, runValidators: true }
    );
  }
  
  // Eliminar columna
  async delete(id: string): Promise<boolean> {
    const result = await this.columnModel.findByIdAndDelete(id);
    return !!result;
  }
  
  // Obtener el máximo orden en un tablero
  async getMaxOrder(boardId: string): Promise<number> {
    const result = await this.columnModel.findOne({ boardId }).sort({ order: -1 });
    return result ? result.order : -1;
  }
  
  // Verificar que todas las columnas pertenecen al mismo tablero
  async validateColumnsBelongToBoard(columnIds: string[], boardId: string): Promise<boolean> {
    const columns = await this.columnModel.find({ 
      _id: { $in: columnIds }, 
      boardId 
    });
    return columns.length === columnIds.length;
  }
}
