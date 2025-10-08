import type { Column, CreateColumnDto, ReorderColumnDto, UpdateColumnDto } from '../types/kanban';
import { apiClient } from './api';

export class ColumnService {
  // Get all columns for a board
  async getBoardColumns(boardId: string): Promise<Column[]> {
    const response = await apiClient.get<Column[]>(`/columns?boardId=${boardId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get column by ID
  async getColumnById(id: string): Promise<Column> {
    const response = await apiClient.get<Column>(`/columns/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Column not found');
    }
    return response.data;
  }

  // Create new column
  async createColumn(columnData: CreateColumnDto): Promise<Column> {
    const response = await apiClient.post<Column>('/columns', columnData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to create column');
    }
    return response.data;
  }

  // Update column
  async updateColumn(id: string, columnData: UpdateColumnDto): Promise<Column> {
    const response = await apiClient.patch<Column>(`/columns/${id}`, columnData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to update column');
    }
    return response.data;
  }

  // Delete column
  async deleteColumn(id: string): Promise<void> {
    const response = await apiClient.delete(`/columns/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Reorder column
  async reorderColumn(reorderData: ReorderColumnDto): Promise<void> {
    const response = await apiClient.patch('/columns/reorder', reorderData);
    if (response.error) {
      throw new Error(response.error);
    }
  }
}

export const columnService = new ColumnService();
