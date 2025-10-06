import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardDto } from './dto/get-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}
  // POST /cards - Crear nueva tarjeta
  @Post()
  async createCard(
    @Body() createCardDto: CreateCardDto,
    @Request() req: any,
  ): Promise<GetCardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.createCard(createCardDto, userId);
  }
  
  // GET /cards?boardId=xxx - Obtener todas las tarjetas de un tablero
  @Get()
  async getBoardCards(
    @Query('boardId') boardId: string,
    @Request() req: any,
  ): Promise<GetCardDto[]> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.getBoardCards(boardId, userId);
  }
  // GET /cards/column/:columnId - Obtener todas las tarjetas de una columna
  @Get('column/:columnId')
  async getColumnCards(
    @Param('columnId') columnId: string,
    @Request() req: any,
  ): Promise<GetCardDto[]> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.getColumnCards(columnId, userId);
  }
  // GET /cards/:id - Obtener tarjeta específica
  @Get(':id')
  async getCardById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GetCardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.getCardById(id, userId);
  }
  
  // PATCH /cards/:id - Actualizar tarjeta
  @Patch(':id')
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Request() req: any
  ): Promise<GetCardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.updateCard(id, updateCardDto, userId);
  }
  
  // PATCH /cards/move - Mover tarjeta
  @Patch('move')
  async moveCard(
    @Body() moveCardDto: MoveCardDto,
    @Request() req: any
  ): Promise<GetCardDto> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.moveCard(moveCardDto, userId);
  }
  
  // GET /cards/stats/:boardId - Obtener estadísticas de un tablero
  @Get('stats/:boardId')
  async getBoardStats(
    @Param('boardId') boardId: string,
    @Request() req: any,
  ): Promise<{ totalCards: number; cardsByColumn: Record<string, number> }> {
    const userId = req.user?.id || 'demo-user';
    return await this.cardsService.getBoardStats(boardId, userId);
  }
  
  // DELETE /cards/:id - Eliminar tarjeta
  @Delete(':id')
  async deleteCard(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id || 'demo-user';
    await this.cardsService.deleteCard(id, userId);
    return { message: 'Card deleted successfully' };
  }
}
