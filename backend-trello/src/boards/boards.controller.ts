import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetBoardDto } from './dto/get-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  
  // POST /boards - Crear nuevo tablero
  @Post()
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req: any // En producción usarías un AuthGuard
  ): Promise<GetBoardDto> {
    const userId = req.user?.id || 'demo-user'; // Demo para testing
    return await this.boardsService.createBoard(createBoardDto, userId);
  }
  
  // GET /boards - Obtener todos los tableros del usuario
  @Get()
  async getUserBoards(@Request() req: any): Promise<GetBoardDto[]> {
    const userId = req.user?.id || 'demo-user';
    return await this.boardsService.getUserBoards(userId);
  }
  
  // GET /boards/:id - Obtener tablero específico
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<GetBoardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.boardsService.getById(id, userId);
  }
  
  // PATCH /boards/:id - Actualizar tablero
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req: any
  ): Promise<GetBoardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.boardsService.update(id, updateBoardDto, userId);
  }
  
  // DELETE /boards/:id - Eliminar tablero
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ message: string }> {
    const userId = req.user?.id || 'demo-user';
    await this.boardsService.delete(id, userId);
    return { message: 'Board deleted successfully' };
  }
}
