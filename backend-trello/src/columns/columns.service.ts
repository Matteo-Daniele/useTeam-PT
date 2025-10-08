import { Injectable, NotFoundException } from '@nestjs/common';
import { ColumnsRepository } from './columns.repository';
import { CreateColumnDto } from './dto/create-column.dto';
import { GetColumnDto } from './dto/get-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private columnsRepository: ColumnsRepository) {}
  
  // Crear una nueva columna
  async createColumn(createColumnDto: CreateColumnDto): Promise<GetColumnDto> {
    const column = await this.columnsRepository.create(createColumnDto);
    return this.mapToDto(column);
  }
  
  // Obtener todas las columnas de un tablero
  async getBoardColumns(boardId: string): Promise<GetColumnDto[]> {
    const columns = await this.columnsRepository.findByBoardId(boardId);
    return columns.map(column => this.mapToDto(column));
  }
  
  // Obtener una columna específica
  async getColumnById(id: string): Promise<GetColumnDto> {
    const column = await this.columnsRepository.findById(id);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    
    return this.mapToDto(column);
  }
  
  // Actualizar columna
  async updateColumn(id: string, updateColumnDto: UpdateColumnDto): Promise<GetColumnDto> {
    const column = await this.columnsRepository.update(id, updateColumnDto);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return this.mapToDto(column);
  }
  
  // Eliminar columna
  async deleteColumn(id: string): Promise<void> {
    const deleted = await this.columnsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Column not found');
    }
  }
  
  // Reordenar columnas
  async reorderColumn(reorderColumnDto: ReorderColumnDto): Promise<void> {
    const { columnOrders, boardId } = reorderColumnDto;

    // Actualizar el orden de todas las columnas
    for (const columnOrder of columnOrders) {
      // Buscar la columna y asegurarse de que pertenece al board correcto
      const column = await this.columnsRepository.findById(columnOrder.columnId);
      if (!column) {
        throw new NotFoundException(`Column ${columnOrder.columnId} not found`);
      }
      if (column.boardId.toString() !== boardId) {
        throw new NotFoundException(`Column ${columnOrder.columnId} does not belong to the specified board`);
      }

      // Actualizar el orden de la columna
      await this.columnsRepository.updateOrder(columnOrder.columnId, columnOrder.order);
    }
  }
  // Método privado para mapear entidad a DTO
  private mapToDto(column: any): GetColumnDto {
    return {
      id: column._id.toString(),
      name: column.name,
      boardId: column.boardId,
      order: column.order,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt
    };
  }
}
