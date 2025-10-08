import { kanbanService } from './kanbanService';
import { websocketService } from './websocket.service';

/**
 * Servicio que extiende kanbanService con funcionalidad de tiempo real
 * Mantiene la API existente pero agrega sincronización WebSocket
 */
export class RealtimeKanbanService {
  /**
   * Crear una tarjeta con sincronización en tiempo real
   */
  static async createCard(cardData: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
  }) {
    try {
      // Crear tarjeta usando el servicio existente
      const newCard = await kanbanService.createCard(cardData);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Tarjeta creada y sincronizada:', newCard);
      
      return newCard;
    } catch (error) {
      console.error('❌ Error creando tarjeta:', error);
      throw error;
    }
  }

  /**
   * Mover una tarjeta con sincronización en tiempo real
   */
  static async moveCard(cardId: string, toColumnId: string, newOrder: number) {
    try {
      // Mover tarjeta usando el servicio existente
      const updatedCard = await kanbanService.moveCard(cardId, toColumnId, newOrder);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Tarjeta movida y sincronizada:', updatedCard);
      
      return updatedCard;
    } catch (error) {
      console.error('❌ Error moviendo tarjeta:', error);
      throw error;
    }
  }

  /**
   * Actualizar una tarjeta con sincronización en tiempo real
   */
  static async updateCard(cardId: string, updates: {
    title?: string;
    description?: string;
  }) {
    try {
      // Actualizar tarjeta usando el servicio existente
      const updatedCard = await kanbanService.updateCard(cardId, updates);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Tarjeta actualizada y sincronizada:', updatedCard);
      
      return updatedCard;
    } catch (error) {
      console.error('❌ Error actualizando tarjeta:', error);
      throw error;
    }
  }

  /**
   * Eliminar una tarjeta con sincronización en tiempo real
   */
  static async deleteCard(cardId: string) {
    try {
      // Eliminar tarjeta usando el servicio existente
      await kanbanService.deleteCard(cardId);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Tarjeta eliminada y sincronizada');
    } catch (error) {
      console.error('❌ Error eliminando tarjeta:', error);
      throw error;
    }
  }

  /**
   * Crear una columna con sincronización en tiempo real
   */
  static async createColumn(columnData: {
    boardId: string;
    name: string;
  }) {
    try {
      // Crear columna usando el servicio existente
      const newColumn = await kanbanService.createColumn(columnData);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Columna creada y sincronizada:', newColumn);
      
      return newColumn;
    } catch (error) {
      console.error('❌ Error creando columna:', error);
      throw error;
    }
  }

  /**
   * Actualizar una columna con sincronización en tiempo real
   */
  static async updateColumn(columnId: string, updates: {
    name?: string;
  }) {
    try {
      // Actualizar columna usando el servicio existente
      const updatedColumn = await kanbanService.updateColumn(columnId, updates);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Columna actualizada y sincronizada:', updatedColumn);
      
      return updatedColumn;
    } catch (error) {
      console.error('❌ Error actualizando columna:', error);
      throw error;
    }
  }

  /**
   * Eliminar una columna con sincronización en tiempo real
   */
  static async deleteColumn(columnId: string) {
    try {
      // Eliminar columna usando el servicio existente
      await kanbanService.deleteColumn(columnId);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Columna eliminada y sincronizada');
    } catch (error) {
      console.error('❌ Error eliminando columna:', error);
      throw error;
    }
  }

  /**
   * Reordenar columnas con sincronización en tiempo real
   */
  static async reorderColumns(boardId: string, columnOrders: { columnId: string; order: number }[]) {
    try {
      // Reordenar columnas usando el servicio existente
      await kanbanService.reorderColumns(boardId, columnOrders);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Columnas reordenadas y sincronizadas');
    } catch (error) {
      console.error('❌ Error reordenando columnas:', error);
      throw error;
    }
  }

  /**
   * Reordenar tarjetas con sincronización en tiempo real
   */
  static async reorderCards(columnId: string, cardOrders: { cardId: string; order: number }[]) {
    try {
      // Reordenar tarjetas usando el servicio existente
      await kanbanService.reorderCards(columnId, cardOrders);
      
      // El backend ya emite el evento WebSocket automáticamente
      console.log('✅ Tarjetas reordenadas y sincronizadas');
    } catch (error) {
      console.error('❌ Error reordenando tarjetas:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de conexión WebSocket
   */
  static getConnectionStatus() {
    return {
      isConnected: websocketService.isConnected(),
      currentBoardId: websocketService.getCurrentBoardId(),
    };
  }
}
