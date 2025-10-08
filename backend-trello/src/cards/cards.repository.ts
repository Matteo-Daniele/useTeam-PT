import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card, CardDocument } from './schemas/card.schema';

@Injectable()
export class CardsRepository {
  constructor(@InjectModel(Card.name) private cardModel: Model<CardDocument>) {}
  
  // Crear una nueva tarjeta
  async create(createCardDto: CreateCardDto): Promise<Card> {
    // Obtener el siguiente orden en la columna
    const maxOrder = await this.getMaxOrderInColumn(createCardDto.columnId);
    
    const card = new this.cardModel({
      ...createCardDto,
      order: maxOrder + 1
    });
    return await card.save();
  }
  
  // Buscar tarjeta por ID
  async findById(id: string): Promise<Card | null> {
    if (!isValidObjectId(id)) return null;
    return await this.cardModel.findById(id);
  }
  
  // Buscar todas las tarjetas de un tablero
  async findByBoardId(boardId: string): Promise<Card[]> {
    return await this.cardModel.find({ boardId }).sort({ order: 1 });
  }
  
  // Buscar todas las tarjetas de una columna
  async findByColumnId(columnId: string): Promise<Card[]> {
    return await this.cardModel.find({ columnId }).sort({ order: 1 });
  }
  
  // Actualizar tarjeta
  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card | null> {
    if (!isValidObjectId(id)) return null;
    return await this.cardModel.findByIdAndUpdate(
      id, 
      updateCardDto, 
      { new: true, runValidators: true }
    );
  }
  
  // Eliminar tarjeta
  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const result = await this.cardModel.findByIdAndDelete(id);
    return !!result;
  }
  
  // Verificar si la tarjeta pertenece al usuario
  async isOwner(cardId: string, userId: string): Promise<boolean> {
    const card = await this.cardModel.findOne({ _id: cardId, userId });
    return !!card;
  }
  
  // Obtener el máximo orden en una columna
  async getMaxOrderInColumn(columnId: string): Promise<number> {
    const result = await this.cardModel.findOne({ columnId }).sort({ order: -1 });
    return result ? result.order : -1;
  }
  
  // Mover tarjeta a otra columna
  async moveCard(moveCardDto: MoveCardDto): Promise<Card | null> {
    const { cardId, toColumnId, newOrder } = moveCardDto;
    // Validar IDs para evitar CastError (500) y responder de forma controlada
    if (!isValidObjectId(cardId) || !isValidObjectId(toColumnId)) {
      return null;
    }
    
    // Actualizar la tarjeta
    return await this.cardModel.findByIdAndUpdate(
      cardId,
      { 
        columnId: toColumnId, 
        order: newOrder 
      },
      { new: true, runValidators: true }
    );
  }
  
  // Reordenar tarjetas en una columna
  async reorderCardsInColumn(columnId: string, cardOrders: Array<{ cardId: string; order: number }>): Promise<void> {
    const bulkOps = cardOrders.map(({ cardId, order }) => ({
      updateOne: {
        filter: { _id: cardId, columnId },
        update: { order }
      }
    }));
    
    await this.cardModel.bulkWrite(bulkOps);
  }
  
  // Verificar que todas las tarjetas pertenecen al mismo tablero
  async validateCardsBelongToBoard(cardIds: string[], boardId: string): Promise<boolean> {
    const cards = await this.cardModel.find({ 
      _id: { $in: cardIds }, 
      boardId 
    });
    return cards.length === cardIds.length;
  }
  
  // Obtener estadísticas de un tablero
  async getBoardStats(boardId: string): Promise<{ totalCards: number; cardsByColumn: Record<string, number> }> {
    const cards = await this.cardModel.find({ boardId });
    const totalCards = cards.length;
    
    const cardsByColumn = cards.reduce((acc, card) => {
      acc[card.columnId] = (acc[card.columnId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalCards, cardsByColumn };
  }
}
