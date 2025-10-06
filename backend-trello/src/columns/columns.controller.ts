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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { GetColumnDto } from './dto/get-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}
  
  // POST /columns - Crear nueva columna
  @Post()
  async createColumn(
    @Body() createColumnDto: CreateColumnDto,
  ): Promise<GetColumnDto> {
    return await this.columnsService.createColumn(createColumnDto);
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
  
  // PATCH /columns/:id - Actualizar columna
  @Patch(':id')
  async updateColumn(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ): Promise<GetColumnDto> {
    return await this.columnsService.updateColumn(id, updateColumnDto);
  }
  
  // DELETE /columns/:id - Eliminar columna
  @Delete(':id')
  async deleteColumn(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.columnsService.deleteColumn(id);
    return { message: 'Column deleted successfully' };
  }
}
