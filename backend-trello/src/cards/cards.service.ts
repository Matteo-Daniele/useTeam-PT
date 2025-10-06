import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CardsRepository } from './cards.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { GetCardDto } from './dto/get-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './schemas/card.schema';

@Injectable()
export class CardsService {
  constructor(private cardsRepository: CardsRepository) {}
  // Crear una nueva tarjeta
  async createCard(
    createCardDto: CreateCardDto,
    userId: string,
  ): Promise<GetCardDto> {
    //validar que no haya demasiadas tarjetas por columna
    const existingCards = await this.cardsRepository.findByColumnId(
      createCardDto.columnId,
    );
    if (existingCards.length >= 50) {
      throw new ForbiddenException('Maximum 50 cards allowed per column');
    }
    //verificar que el título no esté duplicado en la columna
    const existingCard = existingCards.find(
      (card) => card.title.toLowerCase() === createCardDto.title.toLowerCase(),
    );
    if (existingCard) {
      throw new ForbiddenException('Card title already exists in this column');
    }
    const card = await this.cardsRepository.create(createCardDto, userId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(card);
  }
  // Obtener todas las tarjetas de un tablero
  async getBoardCards(boardId: string, userId: string): Promise<GetCardDto[]> {
    // Verificar que el usuario tenga acceso al tablero (esto debería venir de boards service)
    if (!(await this.cardsRepository.isOwner(boardId, userId))) {
      throw new ForbiddenException('You do not have access to this board');
    }
    const cards = await this.cardsRepository.findByBoardId(boardId);
    return cards.map((card) => this.mapToDto(card));
  }
  // Obtener todas las tarjetas de una columna
  async getColumnCards(
    columnId: string,
    userId: string,
  ): Promise<GetCardDto[]> {
    if (!(await this.cardsRepository.isOwner(columnId, userId))) {
      throw new ForbiddenException('You do not have access to this column');
    }
    const cards = await this.cardsRepository.findByColumnId(columnId);
    return cards.map((card) => this.mapToDto(card));
  }
  // Obtener una tarjeta específica
  async getCardById(id: string, userId: string): Promise<GetCardDto> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    // Verificar que el usuario sea el propietario
    if (!(await this.cardsRepository.isOwner(id, userId))) {
      throw new ForbiddenException('You do not have access to this card');
    }
    return this.mapToDto(card);
  }
  // Actualizar tarjeta
  async updateCard(
    id: string,
    updateCardDto: UpdateCardDto,
    userId: string,
  ): Promise<GetCardDto> {
    // Verificar que la tarjeta existe y pertenece al usuario
    // Verificar que la tarjeta existe y pertenece al usuario
    await this.getCardById(id, userId);
    const card = await this.cardsRepository.update(id, updateCardDto);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(card);
  }
  // Mover tarjeta a otra columna
  async moveCard(
    moveCardDto: MoveCardDto,
    userId: string,
  ): Promise<GetCardDto> {
    const { cardId } = moveCardDto;
    // Verificar que la tarjeta existe y pertenece al usuario
    await this.getCardById(cardId, userId);
    // Verificar que la tarjeta se puede mover a la nueva columna
    const card = await this.cardsRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    // Verificar que la nueva columna pertenece al mismo tablero
    if (card.boardId !== moveCardDto.boardId) {
      throw new BadRequestException('Cannot move card to a different board');
    }
    const movedCard = await this.cardsRepository.moveCard(moveCardDto);
    if (!movedCard) {
      throw new NotFoundException('Card not found');
    }
    return this.mapToDto(movedCard);
  }
  // Eliminar tarjeta
  async deleteCard(id: string, userId: string): Promise<void> {
    // Verificar que la tarjeta existe y pertenece al usuario
    await this.getCardById(id, userId);
    const deleted = await this.cardsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Card not found');
    }
  }
  // Obtener estadísticas de un tablero
  async getBoardStats(
    boardId: string,
    userId: string,
  ): Promise<{ totalCards: number; cardsByColumn: Record<string, number> }> {
    // Verificar que el usuario tenga acceso al tablero
    if (!(await this.cardsRepository.isOwner(boardId, userId))) {
      throw new ForbiddenException('You do not have access to this board');
    }
    const cards = await this.cardsRepository.findByBoardId(boardId);
    if (cards.length === 0) {
      return { totalCards: 0, cardsByColumn: {} };
    }
    // Verificar que al menos una tarjeta pertenece al usuario
    const userCards = cards.filter((card) => card.userId === userId);
    if (userCards.length === 0) {
      throw new ForbiddenException('You do not have access to this board');
    }
    return await this.cardsRepository.getBoardStats(boardId);
  }
  // Método privado para mapear entidad a DTO
  private mapToDto(card: Card): GetCardDto {
    return {
      id: card._id.toString(),
      title: card.title,
      description: card.description,
      boardId: card.boardId,
      columnId: card.columnId,
      order: card.order,
      userId: card.userId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    };
  }
}
