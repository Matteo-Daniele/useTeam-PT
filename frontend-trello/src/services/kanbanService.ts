import type { Board, Card, Column, CreateBoardDto, CreateCardDto, CreateColumnDto, ReorderColumnDto } from '../types/kanban';
import { boardService } from './boardService';
import { cardService } from './cardService';
import { columnService } from './columnService';

export interface KanbanBoard {
  id: string;
  name: string;
  description: string;
  columns: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
}

export class KanbanService {
  // Get complete board with columns and cards
  async getKanbanBoard(boardId: string): Promise<KanbanBoard> {
    try {
      // Get board info
      const board = await boardService.getBoardById(boardId);
      
      // Get columns for the board
      const columns = await columnService.getBoardColumns(boardId);
      
      // Get cards for each column
      const columnsWithCards: KanbanColumn[] = await Promise.all(
        columns.map(async (column) => {
          const cards = await cardService.getColumnCards(column.id);
          return {
            id: column.id,
            name: column.name,
            cards: cards.map(card => ({
              id: card.id,
              title: card.title,
              description: card.description
            }))
          };
        })
      );

      return {
        id: board.id,
        name: board.name,
        description: board.description,
        columns: columnsWithCards.sort(() => {
          // Sort columns by their order (we'll need to get this from the backend)
          return 0; // For now, maintain the order from the API
        })
      };
    } catch (error) {
      throw new Error(`Failed to get kanban board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all boards
  async getBoards(): Promise<Board[]> {
    return await boardService.getBoards();
  }

  // Create new board
  async createBoard(boardData: CreateBoardDto): Promise<Board> {
    return await boardService.createBoard(boardData);
  }

  // Update board
  async updateBoard(id: string, boardData: { name?: string; description?: string }): Promise<Board> {
    return await boardService.updateBoard(id, boardData);
  }

  // Delete board
  async deleteBoard(id: string): Promise<void> {
    return await boardService.deleteBoard(id);
  }

  // Create new column
  async createColumn(columnData: CreateColumnDto): Promise<Column> {
    return await columnService.createColumn(columnData);
  }

  // Update column
  async updateColumn(id: string, columnData: { name?: string }): Promise<Column> {
    return await columnService.updateColumn(id, columnData);
  }

  // Delete column
  async deleteColumn(id: string): Promise<void> {
    return await columnService.deleteColumn(id);
  }

  // Reorder column (legacy method)
  async reorderColumn(columnId: string, boardId: string, newOrder: number): Promise<void> {
    const reorder: ReorderColumnDto = {
      boardId: boardId,
      columnOrders: [{ columnId: columnId, order: newOrder }]
    }
    return await columnService.reorderColumn(reorder);
  }

  // Reorder multiple columns (new method)
  async reorderColumns(boardId: string, columnOrders: { columnId: string; order: number }[]): Promise<void> {
    const reorder: ReorderColumnDto = {
      boardId: boardId,
      columnOrders: columnOrders
    }
    return await columnService.reorderColumn(reorder);
  }

  // Create new card
  async createCard(cardData: CreateCardDto): Promise<Card> {
    return await cardService.createCard(cardData);
  }

  // Update card
  async updateCard(id: string, cardData: { title?: string; description?: string }): Promise<Card> {
    return await cardService.updateCard(id, cardData);
  }

  // Delete card
  async deleteCard(id: string): Promise<void> {
    return await cardService.deleteCard(id);
  }

  // Move card between columns
  async moveCard(cardId: string, toColumnId: string, boardId: string, newOrder: number): Promise<void> {
    return await cardService.moveCard({ cardId, toColumnId, boardId, newOrder });
  }

  // Reorder cards within the same column
  async reorderCards(columnId: string, cardOrders: Array<{ cardId: string; order: number }>, boardId: string): Promise<void> {
    return await cardService.reorderCards({ columnId, cardOrders, boardId });
  }
}

export const kanbanService = new KanbanService();
