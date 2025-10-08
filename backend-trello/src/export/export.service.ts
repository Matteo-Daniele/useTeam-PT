import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BoardsService } from '../boards/boards.service';
import { CardsService } from '../cards/cards.service';
import { ColumnsService } from '../columns/columns.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ExportBacklogDto } from './dto/export-backlog.dto';

export interface BacklogData {
  boardId: string;
  boardName: string;
  email: string;
  fields: string[];
  cards: Array<{
    id: string;
    title: string;
    description: string;
    column: string;
    createdAt: string;
  }>;
  requestId: string;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private configService: ConfigService,
    private boardsService: BoardsService,
    private columnsService: ColumnsService,
    private cardsService: CardsService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Exporta el backlog de un board Kanban a través de N8N
   * 
   * Este método es el punto de entrada principal para la exportación. Su flujo es:
   * 1. Genera un ID único para rastrear la solicitud
   * 2. Obtiene todos los datos del board (board, columnas, tarjetas)
   * 3. Estructura los datos en el formato requerido por N8N
   * 4. Envía los datos a N8N via webhook
   * 5. Emite notificaciones WebSocket de éxito/error
   * 
   * @param boardId - ID del board a exportar
   * @param exportBacklogDto - Configuración de exportación (email, campos, etc.)
   * @returns Promise<string> - ID único de la solicitud para tracking
   */
  async exportBoardBacklog(
    boardId: string,
    exportBacklogDto: ExportBacklogDto,
  ): Promise<string> {
    try {
      // Generar ID único para la solicitud - permite rastrear cada exportación
      // Formato: export_[timestamp]_[random_string] para garantizar unicidad
      const requestId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // PASO 1: Validar que el board existe
      const board = await this.boardsService.getById(boardId);
      if (!board) {
        throw new Error(`Board con ID ${boardId} no encontrado`);
      }

      // PASO 2: Obtener todas las columnas del board
      // Las columnas contienen la información de estructura del board
      const columns = await this.columnsService.getBoardColumns(boardId);

      // PASO 3: Obtener todas las tarjetas del board
      // Las tarjetas contienen el contenido real del backlog
      const allCards = await this.cardsService.getBoardCards(boardId);

      // PASO 4: Estructurar datos del Kanban para enviar a N8N
      // Mapeamos cada tarjeta y agregamos información de su columna
      const kanbanData: BacklogData['cards'] = allCards.map((card) => {
        // Encontrar la columna de la tarjeta para obtener su nombre
        const column = columns.find((col) => col.id === card.columnId);
        
        return {
          id: card.id,
          title: card.title,
          description: card.description || '', // Manejar descripciones vacías
          column: column?.name || 'Sin columna', // Fallback si no se encuentra la columna
          createdAt: new Date(card.createdAt).toISOString(), // Formato ISO para N8N
        };
      });

      // PASO 5: Preparar payload completo para N8N
      // Incluye metadatos del board y configuración de exportación
      const backlogData: BacklogData = {
        boardId,
        boardName: exportBacklogDto.boardName || board.name, // Usar nombre personalizado o del board
        email: exportBacklogDto.email,
        fields: exportBacklogDto.fields || ['id', 'title', 'description', 'column', 'createdAt'], // Campos por defecto
        cards: kanbanData,
        requestId,
      };

      // PASO 6: Enviar webhook a N8N y manejar respuesta
      // Este método también emite notificaciones WebSocket automáticamente
      await this.sendToN8N(backlogData);

      this.logger.log(`Exportación iniciada para board ${boardId}, requestId: ${requestId}`);
      
      return requestId;
    } catch (error) {
      this.logger.error(`Error al exportar backlog: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envía los datos del backlog a N8N via webhook y maneja notificaciones
   * 
   * Este método es responsable de:
   * 1. Validar la configuración del webhook
   * 2. Enviar los datos a N8N via HTTP POST
   * 3. Procesar la respuesta de N8N
   * 4. Emitir notificaciones WebSocket de éxito/error
   * 
   * Las notificaciones WebSocket permiten que el frontend reciba feedback
   * inmediato sobre el estado de la exportación sin necesidad de polling.
   * 
   * @param data - Datos del backlog estructurados para N8N
   * @throws Error si N8N no está disponible o responde con error
   */
  private async sendToN8N(data: BacklogData): Promise<void> {
    try {
      // Validar que la URL del webhook esté configurada
      const n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
      
      if (!n8nWebhookUrl) {
        this.logger.warn('N8N_WEBHOOK_URL no configurado');
        throw new Error('N8N_WEBHOOK_URL no está configurado');
      }

      // Log detallado para debugging
      this.logger.log(`Enviando webhook a N8N: ${n8nWebhookUrl}`);
      this.logger.log(`Datos a enviar:`, JSON.stringify(data, null, 2));

      // Enviar webhook a N8N via HTTP POST
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Payload con todos los datos del backlog
      });

      // Procesar respuesta de N8N
      const responseText = await response.text();
      this.logger.log(`Respuesta de N8N (${response.status}):`, responseText);

      // Validar que N8N respondió correctamente
      if (!response.ok) {
        throw new Error(`N8N webhook falló: ${response.status} - ${responseText}`);
      }

      this.logger.log(`Webhook enviado exitosamente a N8N para requestId: ${data.requestId}`);
      
      // NOTIFICACIÓN DE ÉXITO: Emitir evento WebSocket a todos los usuarios del board
      // Esto permite que el frontend muestre notificación inmediata de éxito
      this.realtimeGateway.server.to(`board:${data.boardId}`).emit('export:success', {
        requestId: data.requestId,
        boardId: data.boardId,
        boardName: data.boardName,
        email: data.email,
        message: 'Exportación iniciada exitosamente. El email será enviado en breve.',
        timestamp: new Date(),
      });
      
    } catch (error) {
      this.logger.error(`Error al enviar webhook a N8N: ${error.message}`);
      
      // NOTIFICACIÓN DE ERROR: Emitir evento WebSocket con detalles del error
      // Incluye información útil para el usuario (email, board, mensaje de error)
      this.realtimeGateway.server.to(`board:${data.boardId}`).emit('export:error', {
        requestId: data.requestId,
        boardId: data.boardId,
        boardName: data.boardName,
        email: data.email,
        error: error.message,
        message: 'Error al procesar la exportación. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
      });
      
      throw error; // Re-lanzar el error para que se propague al controlador
    }
  }
}
