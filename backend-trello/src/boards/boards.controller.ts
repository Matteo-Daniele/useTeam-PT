import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetBoardDto } from './dto/get-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(
    private boardsService: BoardsService,
    private realtimeGateway: RealtimeGateway,
  ) {}
  
  // POST /boards - Crear nuevo tablero
  @Post()
  async createBoard(@Body() createBoardDto: CreateBoardDto): Promise<GetBoardDto> {
    const board = await this.boardsService.createBoard(createBoardDto);
    
    // Emitir evento de tiempo real a todos los usuarios conectados
    // Como es un board nuevo, emitimos a todos los usuarios
    this.realtimeGateway.server.emit('board:created', {
      board,
      timestamp: new Date(),
    });
    
    return board;
  }
  
  // GET /boards - Obtener todos los tableros
  @Get()
  async getAllBoards(): Promise<GetBoardDto[]> {
    return await this.boardsService.getAllBoards();
  }
  
  // GET /boards/:id - Obtener tablero específico
  @Get(':id')
  async getById(@Param('id') id: string): Promise<GetBoardDto> {
    return await this.boardsService.getById(id);
  }
  
  // PATCH /boards/:id - Actualizar tablero
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto
  ): Promise<GetBoardDto> {
    const board = await this.boardsService.update(id, updateBoardDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitBoardUpdated(id, board);
    
    return board;
  }
  
  // DELETE /boards/:id - Eliminar tablero
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.boardsService.delete(id);
    
    // Emitir evento de tiempo real para notificar eliminación a todos los usuarios
    this.realtimeGateway.server.emit('board:deleted', {
      boardId: id,
      timestamp: new Date(),
    });
    
    return { message: 'Board deleted successfully' };
  }
}
