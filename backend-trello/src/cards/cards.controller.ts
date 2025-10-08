import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardDto } from './dto/get-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ReorderCardsDto } from './dto/reorder-cards.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(
    private cardsService: CardsService,
    private realtimeGateway: RealtimeGateway,
  ) {}
  // POST /cards - Crear nueva tarjeta
  @Post()
  async createCard(@Body() createCardDto: CreateCardDto): Promise<GetCardDto> {
    const card = await this.cardsService.createCard(createCardDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitCardCreated(createCardDto.boardId, card);
    
    return card;
  }
  
  // GET /cards?boardId=xxx OR ?columnId=xxx - Obtener tarjetas
  @Get()
  async getCards(
    @Query('boardId') boardId?: string,
    @Query('columnId') columnId?: string
  ): Promise<GetCardDto[]> {
    if (boardId) {
      return await this.cardsService.getBoardCards(boardId);
    }
    if (columnId) {
      return await this.cardsService.getColumnCards(columnId);
    }
    // Si no se proporciona ningún parámetro, retornar array vacío
    return [];
  }
  
  // PATCH /cards/move - Mover tarjeta
  @Patch('move')
  async moveCard(@Body() body: any): Promise<GetCardDto> {
    // Adaptación flexible del payload para evitar errores de validación
    const moveCardDto: MoveCardDto = {
      cardId: String(body.cardId),
      toColumnId: String(body.toColumnId),
      boardId: String(body.boardId),
      newOrder: Number(body.newOrder),
    };
    
    const card = await this.cardsService.moveCard(moveCardDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitCardMoved(
      moveCardDto.boardId, 
      card, 
      body.fromColumnId || '', 
      moveCardDto.toColumnId
    );
    
    return card;
  }

  // PATCH /cards/reorder - Reordenar tarjetas dentro de una columna
  @Patch('reorder')
  async reorderCards(@Body() reorderDto: ReorderCardsDto): Promise<{ message: string }> {
    await this.cardsService.reorderCardsInColumn(reorderDto.columnId, reorderDto.cardOrders);
    
    // Emitir evento de tiempo real para reordenamiento
    this.realtimeGateway.server.to(`board:${reorderDto.boardId}`).emit('cards:reordered', {
      boardId: reorderDto.boardId,
      columnId: reorderDto.columnId,
      cardOrders: reorderDto.cardOrders,
      timestamp: new Date(),
    });
    
    return { message: 'Cards reordered successfully' };
  }
  
  // GET /cards/:id - Obtener tarjeta específica
  @Get(':id')
  async getCardById(@Param('id') id: string): Promise<GetCardDto> {
    return await this.cardsService.getCardById(id);
  }
  
  // PATCH /cards/:id - Actualizar tarjeta
  @Patch(':id')
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto
  ): Promise<GetCardDto> {
    const card = await this.cardsService.updateCard(id, updateCardDto);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitCardUpdated(card.boardId, card);
    
    return card;
  }
  
  // DELETE /cards/:id - Eliminar tarjeta
  @Delete(':id')
  async deleteCard(@Param('id') id: string): Promise<{ message: string }> {
    // Obtener la tarjeta antes de eliminarla para emitir el evento
    const card = await this.cardsService.getCardById(id);
    await this.cardsService.deleteCard(id);
    
    // Emitir evento de tiempo real
    this.realtimeGateway.emitCardDeleted(card.boardId, id);
    
    return { message: 'Card deleted successfully' };
  }
}
