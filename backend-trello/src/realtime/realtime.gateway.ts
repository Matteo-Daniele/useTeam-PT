import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/kanban',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('RealtimeGateway');
  private connectedUsers: Map<string, Set<string>> = new Map(); // boardId -> Set of socketIds

  /**
   * Maneja nuevas conexiones WebSocket
   * Se ejecuta cuando un cliente se conecta
   */
  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  /**
   * Maneja desconexiones WebSocket
   * Se ejecuta cuando un cliente se desconecta
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    
    // Remover usuario de todos los boards
    this.connectedUsers.forEach((users, boardId) => {
      if (users.has(client.id)) {
        users.delete(client.id);
        // Notificar a otros usuarios que alguien se fue
        client.to(`board:${boardId}`).emit('user:left', {
          socketId: client.id,
          timestamp: new Date(),
        });
      }
    });
  }

  /**
   * Unirse a un board específico
   * Cliente emite: socket.emit('board:join', { boardId })
   */
  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const { boardId } = data;
    
    // Salir de otros boards primero
    this.leaveAllBoards(client);
    
    // Unirse al nuevo board
    client.join(`board:${boardId}`);
    
    // Registrar usuario en el board
    if (!this.connectedUsers.has(boardId)) {
      this.connectedUsers.set(boardId, new Set());
    }
    this.connectedUsers.get(boardId)!.add(client.id);
    
    this.logger.log(`Cliente ${client.id} se unió al board ${boardId}`);
    
    // Notificar a otros usuarios del board
    client.to(`board:${boardId}`).emit('user:joined', {
      socketId: client.id,
      boardId,
      timestamp: new Date(),
    });
    
    // Confirmar al cliente que se unió
    client.emit('board:joined', { boardId });
  }

  /**
   * Salir de un board específico
   * Cliente emite: socket.emit('board:leave', { boardId })
   */
  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    const { boardId } = data;
    this.leaveBoard(client, boardId);
  }

  /**
   * Eventos de tarjetas - Crear
   * Se emite desde los controladores cuando se crea una tarjeta
   */
  emitCardCreated(boardId: string, card: any) {
    this.server.to(`board:${boardId}`).emit('card:created', {
      card,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de tarjetas - Actualizar
   * Se emite desde los controladores cuando se actualiza una tarjeta
   */
  emitCardUpdated(boardId: string, card: any) {
    this.server.to(`board:${boardId}`).emit('card:updated', {
      card,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de tarjetas - Mover
   * Se emite desde los controladores cuando se mueve una tarjeta
   */
  emitCardMoved(boardId: string, card: any, fromColumnId: string, toColumnId: string) {
    this.server.to(`board:${boardId}`).emit('card:moved', {
      card,
      fromColumnId,
      toColumnId,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de tarjetas - Eliminar
   * Se emite desde los controladores cuando se elimina una tarjeta
   */
  emitCardDeleted(boardId: string, cardId: string) {
    this.server.to(`board:${boardId}`).emit('card:deleted', {
      cardId,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de columnas - Crear
   * Se emite desde los controladores cuando se crea una columna
   */
  emitColumnCreated(boardId: string, column: any) {
    this.server.to(`board:${boardId}`).emit('column:created', {
      column,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de columnas - Actualizar
   * Se emite desde los controladores cuando se actualiza una columna
   */
  emitColumnUpdated(boardId: string, column: any) {
    this.server.to(`board:${boardId}`).emit('column:updated', {
      column,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de columnas - Eliminar
   * Se emite desde los controladores cuando se elimina una columna
   */
  emitColumnDeleted(boardId: string, columnId: string) {
    this.server.to(`board:${boardId}`).emit('column:deleted', {
      columnId,
      timestamp: new Date(),
    });
  }

  /**
   * Eventos de boards - Actualizar
   * Se emite desde los controladores cuando se actualiza un board
   */
  emitBoardUpdated(boardId: string, board: any) {
    this.server.to(`board:${boardId}`).emit('board:updated', {
      board,
      timestamp: new Date(),
    });
  }

  /**
   * Método privado para salir de un board específico
   */
  private leaveBoard(client: Socket, boardId: string) {
    client.leave(`board:${boardId}`);
    
    // Remover de la lista de usuarios conectados
    const users = this.connectedUsers.get(boardId);
    if (users) {
      users.delete(client.id);
    }
    
    // Notificar a otros usuarios
    client.to(`board:${boardId}`).emit('user:left', {
      socketId: client.id,
      boardId,
      timestamp: new Date(),
    });
    
    this.logger.log(`Cliente ${client.id} salió del board ${boardId}`);
  }

  /**
   * Método privado para salir de todos los boards
   */
  private leaveAllBoards(client: Socket) {
    this.connectedUsers.forEach((users, boardId) => {
      if (users.has(client.id)) {
        this.leaveBoard(client, boardId);
      }
    });
  }

  /**
   * Obtener usuarios conectados a un board
   */
  getConnectedUsers(boardId: string): number {
    return this.connectedUsers.get(boardId)?.size || 0;
  }
}
