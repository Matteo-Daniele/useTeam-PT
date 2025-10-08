export interface Card {
  id: string;
  title: string;
  description: string;
  boardId: string;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend-specific types for Kanban components
export interface KanbanCard {
  id: string;
  title: string;
  description: string;
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: string;
  name: string;
  description: string;
  columns: KanbanColumn[];
}

// DTOs for API requests
export interface CreateBoardDto {
  name: string;
  description?: string;
}

export interface CreateColumnDto {
  name: string;
  boardId: string;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
}

export interface UpdateColumnDto {
  name?: string;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
}

export interface ReorderColumnDto {
  boardId: string;
  columnOrders: { columnId: string; order: number }[];
}

export interface MoveCardDto {
  cardId: string;
  toColumnId: string;
  boardId: string;
  newOrder: number;
}  

export interface ReorderCardsDto {
  columnId: string;
  cardOrders: Array<{ cardId: string; order: number }>;
}