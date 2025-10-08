import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { GetColumnDto } from './dto/get-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(
    private columnsService: ColumnsService,
    private realtimeGateway: RealtimeGateway,
  ) {}
  
  // POST /columns - Crear nueva columna
  @Post()
  async createColumn(
    @Body() createColumnDto: CreateColumnDto,
  ): Promise<GetColumnDto> {
    const column = await this.columnsService.createColumn(createColumnDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitColumnCreated(createColumnDto.boardId, column);
    
    return column;
  }
  
  // GET /columns?boardId=xxx - Obtener todas las columnas de un tablero
  @Get()
  async getBoardColumns(
    @Query('boardId') boardId: string,
  ): Promise<GetColumnDto[]> {
    return await this.columnsService.getBoardColumns(boardId);
  }
  
  // GET /columns/:id - Obtener columna específica
  @Get(':id')
  async getColumnById(
    @Param('id') id: string,
  ): Promise<GetColumnDto> {
    return await this.columnsService.getColumnById(id);
  }
  
  // PATCH /columns/reorder - Reordenar columnas
  // Nota: declarar rutas estáticas antes que las dinámicas evita capturar 'reorder' como ':id'
  @Patch('reorder')
  async reorderColumn(
    @Body() reorderColumnDto: ReorderColumnDto,
  ): Promise<{ message: string }> {
    await this.columnsService.reorderColumn(reorderColumnDto);
    
    // Emitir evento de tiempo real para reordenamiento
    this.realtimeGateway.server.to(`board:${reorderColumnDto.boardId}`).emit('columns:reordered', {
      boardId: reorderColumnDto.boardId,
      columnOrders: reorderColumnDto.columnOrders,
      timestamp: new Date(),
    });
    
    return { message: 'Column reordered successfully' };
  }

  // PATCH /columns/:id - Actualizar columna
  @Patch(':id')
  async updateColumn(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ): Promise<GetColumnDto> {
    const column = await this.columnsService.updateColumn(id, updateColumnDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitColumnUpdated(column.boardId, column);
    
    return column;
  }
  
  // DELETE /columns/:id - Eliminar columna
  @Delete(':id')
  async deleteColumn(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    // Obtener la columna antes de eliminarla para emitir el evento
    const column = await this.columnsService.getColumnById(id);
    await this.columnsService.deleteColumn(id);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitColumnDeleted(column.boardId, id);
    
    return { message: 'Column deleted successfully' };
  }
  
}
