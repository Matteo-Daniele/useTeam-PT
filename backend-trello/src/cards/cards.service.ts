import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardsRepository } from './cards.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardDto } from './dto/get-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private cardsRepository: CardsRepository) {}
  
  // Crear una nueva tarjeta
  async createCard(createCardDto: CreateCardDto): Promise<GetCardDto> {
    const card = await this.cardsRepository.create(createCardDto);
    return this.mapToDto(card);
  }
  
  // Obtener todas las tarjetas de un tablero
  async getBoardCards(boardId: string): Promise<GetCardDto[]> {
    const cards = await this.cardsRepository.findByBoardId(boardId);
    return cards.map((card) => this.mapToDto(card));
  }
  
  // Obtener todas las tarjetas de una columna
  async getColumnCards(columnId: string): Promise<GetCardDto[]> {
    const cards = await this.cardsRepository.findByColumnId(columnId);
    return cards.map((card) => this.mapToDto(card));
  }
  
  // Obtener una tarjeta específica
  async getCardById(id: string): Promise<GetCardDto> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(card);
  }
  
  // Actualizar tarjeta
  async updateCard(id: string, updateCardDto: UpdateCardDto): Promise<GetCardDto> {
    const card = await this.cardsRepository.update(id, updateCardDto);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(card);
  }
  
  // Eliminar tarjeta
  async deleteCard(id: string): Promise<void> {
    const deleted = await this.cardsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Card not found');
    }
  }
  
  // Mover tarjeta
  async moveCard(moveCardDto: MoveCardDto): Promise<GetCardDto> {
    const movedCard = await this.cardsRepository.moveCard(moveCardDto);
    if (!movedCard) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(movedCard);
  }

  // Reordenar tarjetas en una columna
  async reorderCardsInColumn(columnId: string, cardOrders: Array<{ cardId: string; order: number }>): Promise<void> {
    await this.cardsRepository.reorderCardsInColumn(columnId, cardOrders);
  }
  
  // Método privado para mapear entidad a DTO
  private mapToDto(card: any): GetCardDto {
    return {
      id: card._id.toString(),
      title: card.title,
      description: card.description,
      boardId: card.boardId,
      columnId: card.columnId,
      order: card.order,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }
}