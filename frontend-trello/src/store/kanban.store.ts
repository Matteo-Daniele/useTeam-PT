import { create } from 'zustand';
import { websocketService } from '../services/websocket.service';

// Interfaces para el estado
export interface Board {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanState {
  // Estado de la aplicación
  currentBoard: Board | null;
  columns: Column[];
  cards: Card[];
  isLoading: boolean;
  error: string | null;
  
  // Estado de WebSocket
  isConnected: boolean;
  connectedUsers: number;
  
  // Acciones para boards
  setCurrentBoard: (board: Board | null) => void;
  updateBoard: (board: Board) => void;
  
  // Acciones para columns
  setColumns: (columns: Column[]) => void;
  addColumn: (column: Column) => void;
  updateColumn: (column: Column) => void;
  removeColumn: (columnId: string) => void;
  reorderColumns: (columns: Column[]) => void;
  
  // Acciones para cards
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => void;
  reorderCards: (columnId: string, cardOrders: { cardId: string; order: number }[]) => void;
  
  // Acciones de UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones de WebSocket
  setConnected: (connected: boolean) => void;
  setConnectedUsers: (count: number) => void;
  
  // Acciones de sincronización
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
  setupWebSocketListeners: () => void;
  cleanupWebSocketListeners: () => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  // Estado inicial
  currentBoard: null,
  columns: [],
  cards: [],
  isLoading: false,
  error: null,
  isConnected: false,
  connectedUsers: 0,

  // Acciones para boards
  setCurrentBoard: (board) => {
    set({ currentBoard: board });
  },

  updateBoard: (board) => {
    set((state) => ({
      currentBoard: state.currentBoard?.id === board.id ? board : state.currentBoard
    }));
  },

  // Acciones para columns
  setColumns: (columns) => {
    set({ columns: columns.sort((a, b) => a.order - b.order) });
  },

  addColumn: (column) => {
    set((state) => ({
      columns: [...state.columns, column].sort((a, b) => a.order - b.order)
    }));
  },

  updateColumn: (column) => {
    set((state) => ({
      columns: state.columns.map(c => 
        c.id === column.id ? column : c
      ).sort((a, b) => a.order - b.order)
    }));
  },

  removeColumn: (columnId) => {
    set((state) => ({
      columns: state.columns.filter(c => c.id !== columnId),
      cards: state.cards.filter(card => card.columnId !== columnId)
    }));
  },

  reorderColumns: (columns) => {
    set({ columns: columns.sort((a, b) => a.order - b.order) });
  },

  // Acciones para cards
  setCards: (cards) => {
    set({ cards: cards.sort((a, b) => a.order - b.order) });
  },

  addCard: (card) => {
    set((state) => ({
      cards: [...state.cards, card].sort((a, b) => a.order - b.order)
    }));
  },

  updateCard: (card) => {
    set((state) => ({
      cards: state.cards.map(c => 
        c.id === card.id ? card : c
      ).sort((a, b) => a.order - b.order)
    }));
  },

  removeCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter(c => c.id !== cardId)
    }));
  },

  moveCard: (cardId, fromColumnId, toColumnId, newOrder) => {
    set((state) => ({
      cards: state.cards.map(card => 
        card.id === cardId 
          ? { ...card, columnId: toColumnId, order: newOrder }
          : card
      ).sort((a, b) => a.order - b.order)
    }));
  },

  reorderCards: (columnId, cardOrders) => {
    set((state) => ({
      cards: state.cards.map(card => {
        if (card.columnId === columnId) {
          const newOrder = cardOrders.find(co => co.cardId === card.id);
          return newOrder ? { ...card, order: newOrder.order } : card;
        }
        return card;
      }).sort((a, b) => a.order - b.order)
    }));
  },

  // Acciones de UI
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  // Acciones de WebSocket
  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  setConnectedUsers: (count) => {
    set({ connectedUsers: count });
  },

  // Acciones de sincronización
  joinBoard: (boardId) => {
    const state = get();
    if (state.currentBoard?.id !== boardId) {
      // Limpiar estado anterior
      set({ columns: [], cards: [], error: null });
    }
    
    websocketService.joinBoard(boardId);
    set({ isConnected: websocketService.isConnected() });
  },

  leaveBoard: (boardId) => {
    websocketService.leaveBoard(boardId);
    set({ isConnected: websocketService.isConnected() });
  },

  setupWebSocketListeners: () => {
    const state = get();
    
    // Eventos de tarjetas
    websocketService.on('card:created', (data) => {
      console.log('Tarjeta creada:', data.card);
      state.addCard(data.card);
    });

    websocketService.on('card:updated', (data) => {
      console.log('Tarjeta actualizada:', data.card);
      state.updateCard(data.card);
    });

    websocketService.on('card:moved', (data) => {
      console.log('Tarjeta movida:', data);
      state.moveCard(data.card.id, data.fromColumnId, data.toColumnId, data.card.order);
    });

    websocketService.on('card:deleted', (data) => {
      console.log('Tarjeta eliminada:', data.cardId);
      state.removeCard(data.cardId);
    });

    // Eventos de columnas
    websocketService.on('column:created', (data) => {
      console.log('Columna creada:', data.column);
      state.addColumn(data.column);
    });

    websocketService.on('column:updated', (data) => {
      console.log('Columna actualizada:', data.column);
      state.updateColumn(data.column);
    });

    websocketService.on('column:deleted', (data) => {
      console.log('Columna eliminada:', data.columnId);
      state.removeColumn(data.columnId);
    });

    // Eventos de boards
    websocketService.on('board:updated', (data) => {
      console.log('Board actualizado:', data.board);
      state.updateBoard(data.board);
    });

    // Eventos de usuarios
    websocketService.on('user:joined', (data) => {
      console.log('Usuario se unió:', data.socketId);
      // Aquí podrías actualizar una lista de usuarios conectados
    });

    websocketService.on('user:left', (data) => {
      console.log('Usuario salió:', data.socketId);
      // Aquí podrías actualizar una lista de usuarios conectados
    });

    // Eventos de conexión
    websocketService.on('board:joined', (data) => {
      console.log('Unido al board:', data.boardId);
    });
  },

  cleanupWebSocketListeners: () => {
    // Remover todos los listeners
    websocketService.off('card:created');
    websocketService.off('card:updated');
    websocketService.off('card:moved');
    websocketService.off('card:deleted');
    websocketService.off('column:created');
    websocketService.off('column:updated');
    websocketService.off('column:deleted');
    websocketService.off('board:updated');
    websocketService.off('user:joined');
    websocketService.off('user:left');
    websocketService.off('board:joined');
  },
}));
