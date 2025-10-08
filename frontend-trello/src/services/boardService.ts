import type { Board, CreateBoardDto, UpdateBoardDto } from '../types/kanban';
import { apiClient } from './api';

export class BoardService {
  // Get all boards
  async getBoards(): Promise<Board[]> {
    const response = await apiClient.get<Board[]>('/boards');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get board by ID
  async getBoardById(id: string): Promise<Board> {
    const response = await apiClient.get<Board>(`/boards/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Board not found');
    }
    return response.data;
  }

  // Create new board
  async createBoard(boardData: CreateBoardDto): Promise<Board> {
    const response = await apiClient.post<Board>('/boards', boardData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create board');
    }
    return response.data;
  }

  // Update board
  async updateBoard(id: string, boardData: UpdateBoardDto): Promise<Board> {
    const response = await apiClient.patch<Board>(`/boards/${id}`, boardData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update board');
    }
    return response.data;
  }

  // Delete board
  async deleteBoard(id: string): Promise<void> {
    const response = await apiClient.delete(`/boards/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  }
}

export const boardService = new BoardService();
