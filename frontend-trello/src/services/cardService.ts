import type { Card, CreateCardDto, MoveCardDto, ReorderCardsDto, UpdateCardDto } from '../types/kanban';
import { apiClient } from './api';

export class CardService {
  // Get all cards for a board
  async getBoardCards(boardId: string): Promise<Card[]> {
    const response = await apiClient.get<Card[]>(`/cards?boardId=${boardId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get all cards for a column
  async getColumnCards(columnId: string): Promise<Card[]> {
    const response = await apiClient.get<Card[]>(`/cards?columnId=${columnId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get card by ID
  async getCardById(id: string): Promise<Card> {
    const response = await apiClient.get<Card>(`/cards/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Card not found');
    }
    return response.data;
  }

  // Create new card
  async createCard(cardData: CreateCardDto): Promise<Card> {
    const response = await apiClient.post<Card>('/cards', cardData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create card');
    }
    return response.data;
  }

  // Update card
  async updateCard(id: string, cardData: UpdateCardDto): Promise<Card> {
    const response = await apiClient.patch<Card>(`/cards/${id}`, cardData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update card');
    }
    return response.data;
  }

  // Delete card
  async deleteCard(id: string): Promise<void> {
    const response = await apiClient.delete(`/cards/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Move card to different column
  async moveCard(moveData: MoveCardDto): Promise<void> {
    const response = await apiClient.patch('/cards/move', moveData);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Reorder cards within the same column
  async reorderCards(reorderData: ReorderCardsDto): Promise<void> {
    console.log('Sending reorder request:', reorderData);
    const response = await apiClient.patch('/cards/reorder', reorderData);
    if (response.error) {
      console.error('Reorder error:', response.error);
      throw new Error(response.error);
    }
  }
}

export const cardService = new CardService();
