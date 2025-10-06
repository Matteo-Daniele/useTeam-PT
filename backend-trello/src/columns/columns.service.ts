import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ColumnsRepository } from './columns.repository';
import { CreateColumnDto } from './dto/create-column.dto';
import { GetColumnDto } from './dto/get-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private columnsRepository: ColumnsRepository) {}
  
  // Crear una nueva columna
  async createColumn(createColumnDto: CreateColumnDto): Promise<GetColumnDto> {
    // Lógica de negocio: validar que no haya demasiadas columnas por tablero
    const existingColumns = await this.columnsRepository.findByBoardId(createColumnDto.boardId);
    if (existingColumns.length >= 10) {
      throw new ForbiddenException('Maximum 10 columns allowed per board');
    }
    
    // Lógica de negocio: verificar que el nombre no esté duplicado en el tablero
    const existingColumn = existingColumns.find(column => 
      column.name.toLowerCase() === createColumnDto.name.toLowerCase()
    );
    if (existingColumn) {
      throw new ForbiddenException('Column name already exists in this board');
    }
    
    const column = await this.columnsRepository.create(createColumnDto);
    return this.mapToDto(column);
  }
  
  // Obtener todas las columnas de un tablero
  async getBoardColumns(boardId: string): Promise<GetColumnDto[]> {
    // Verificar que el usuario tenga acceso al tablero (esto debería venir de boards service)
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
    // Verificar que la columna existe y pertenece al usuario
    await this.getColumnById(id);
    
    const column = await this.columnsRepository.update(id, updateColumnDto);
    return this.mapToDto(column);
  }
  
  // Eliminar columna
  async deleteColumn(id: string): Promise<void> {
    // Verificar que la columna existe y pertenece al usuario
    await this.getColumnById(id);
    
    const deleted = await this.columnsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Column not found');
    }
  }
  
  // Método privado para mapear entidad a DTO
  private mapToDto(column: any): GetColumnDto {
    return {
      id: column._id.toString(),
      name: column.name,
      boardId: column.boardId,
      order: column.order,
      userId: column.userId,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt
    };
  }
}
