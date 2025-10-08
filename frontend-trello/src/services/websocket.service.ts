import { io, Socket } from 'socket.io-client';

export interface WebSocketEvents {
  // Eventos del servidor al cliente
  'card:created': (data: { card: any; timestamp: Date }) => void;
  'card:updated': (data: { card: any; timestamp: Date }) => void;
  'card:moved': (data: { card: any; fromColumnId: string; toColumnId: string; timestamp: Date }) => void;
  'card:deleted': (data: { cardId: string; timestamp: Date }) => void;
  'cards:reordered': (data: { boardId: string; columnId: string; cardOrders: any[]; timestamp: Date }) => void;
  'column:created': (data: { column: any; timestamp: Date }) => void;
  'column:updated': (data: { column: any; timestamp: Date }) => void;
  'column:deleted': (data: { columnId: string; timestamp: Date }) => void;
  'columns:reordered': (data: { boardId: string; columnOrders: any[]; timestamp: Date }) => void;
  'board:created': (data: { board: any; timestamp: Date }) => void;
  'board:updated': (data: { board: any; timestamp: Date }) => void;
  'board:deleted': (data: { boardId: string; timestamp: Date }) => void;
  'export:success': (data: { requestId: string; boardId: string; boardName: string; email: string; message: string; timestamp: Date }) => void;
  'export:error': (data: { requestId: string; boardId: string; boardName: string; email: string; error: string; message: string; timestamp: Date }) => void;
  'user:joined': (data: { socketId: string; boardId?: string; timestamp: Date }) => void;
  'user:left': (data: { socketId: string; boardId?: string; timestamp: Date }) => void;
  'board:joined': (data: { boardId: string }) => void;
}

export interface WebSocketClientEvents {
  // Eventos del cliente al servidor
  'board:join': (data: { boardId: string }) => void;
  'board:leave': (data: { boardId: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private currentBoardId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo

  /**
   * Conectar al servidor WebSocket
   * Se ejecuta cuando se inicializa la aplicación
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket ya está conectado');
      return;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    console.log('Conectando a WebSocket:', serverUrl);

    this.socket = io(`${serverUrl}/kanban`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * Desconectar del servidor WebSocket
   * Se ejecuta cuando se cierra la aplicación
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentBoardId = null;
    }
  }

  /**
   * Unirse a un board específico
   * Notifica al servidor que queremos recibir eventos de este board
   */
  joinBoard(boardId: string): void {
    if (!this.socket) {
      console.error('WebSocket no está conectado');
      return;
    }

    // Salir del board anterior si existe
    if (this.currentBoardId && this.currentBoardId !== boardId) {
      this.leaveBoard(this.currentBoardId);
    }

    this.currentBoardId = boardId;
    this.socket.emit('board:join', { boardId });
    console.log(`Uniéndose al board: ${boardId}`);
  }

  /**
   * Salir de un board específico
   * Deja de recibir eventos de este board
   */
  leaveBoard(boardId: string): void {
    if (!this.socket) {
      console.error('WebSocket no está conectado');
      return;
    }

    this.socket.emit('board:leave', { boardId });
    console.log(`Saliendo del board: ${boardId}`);

    if (this.currentBoardId === boardId) {
      this.currentBoardId = null;
    }
  }

  /**
   * Escuchar eventos del servidor
   * Permite registrar callbacks para diferentes tipos de eventos
   */
  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (!this.socket) {
      console.error('WebSocket no está conectado');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Dejar de escuchar un evento específico
   * Útil para limpiar listeners cuando se desmontan componentes
   */
  off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Obtener el estado de la conexión
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener el ID del board actual
   */
  getCurrentBoardId(): string | null {
    return this.currentBoardId;
  }

  /**
   * Configurar listeners para eventos del sistema
   * Maneja conexión, desconexión y errores
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket conectado:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      this.handleReconnection();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconectado después de ${attemptNumber} intentos`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Error de reconexión WebSocket:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Falló la reconexión WebSocket después de múltiples intentos');
    });
  }

  /**
   * Manejar lógica de reconexión
   * Implementa backoff exponencial para evitar spam
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    }
  }
}

// Crear instancia singleton
export const websocketService = new WebSocketService();

// Hook personalizado para usar WebSocket en componentes React
export const useWebSocket = () => {
  return websocketService;
};
