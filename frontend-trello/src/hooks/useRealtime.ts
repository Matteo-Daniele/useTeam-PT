import { useEffect, useRef } from 'react';
import { websocketService } from '../services/websocket.service';
import { useNotifications } from './useNotifications';

/**
 * Hook para integrar WebSocket con el sistema Kanban existente
 * Se conecta automáticamente y maneja eventos de tiempo real
 */
export const useRealtime = (boardId: string | null, onRefresh?: () => void, currentBoard?: { name: string }) => {
  const isConnectedRef = useRef(false);
  const { addNotification, notifications, removeNotification } = useNotifications();

  useEffect(() => {
    if (!boardId) return;

    // Conectar WebSocket si no está conectado
    if (!isConnectedRef.current) {
      websocketService.connect();
      isConnectedRef.current = true;
    }

    // Unirse al board
    websocketService.joinBoard(boardId);

    // Configurar listeners para eventos de tiempo real
    const handleCardCreated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Tarjeta creada en tiempo real:', data.card);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Tarjeta Creada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, card modificada`
      });

      // Refrescar el board para mostrar la nueva tarjeta
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleCardUpdated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Tarjeta actualizada en tiempo real:', data.card);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Tarjeta Actualizada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, card modificada`
      });

      // Refrescar el board para mostrar los cambios
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleCardMoved = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Tarjeta movida en tiempo real:', data);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Tarjeta Movida',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, card modificada`
      });

      // Refrescar el board para mostrar el movimiento
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleCardDeleted = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Tarjeta eliminada en tiempo real:', data.cardId);

      // Generar notificación
      addNotification({
        type: 'warning',
        title: 'Tarjeta Eliminada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, card modificada`
      });

      // Refrescar el board para ocultar la tarjeta eliminada
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleColumnCreated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Columna creada en tiempo real:', data.column);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Columna Creada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, column modificada`
      });

      // Refrescar el board para mostrar la nueva columna
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleColumnUpdated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Columna actualizada en tiempo real:', data.column);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Columna Actualizada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, column modificada`
      });

      // Refrescar el board para mostrar los cambios
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleColumnDeleted = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Columna eliminada en tiempo real:', data.columnId);

      // Generar notificación
      addNotification({
        type: 'warning',
        title: 'Columna Eliminada',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, column modificada`
      });

      // Refrescar el board para ocultar la columna eliminada
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleBoardUpdated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Board actualizado en tiempo real:', data.board);

      // Si el board fue eliminado, no refrescar
      if (data.board && data.board.deleted) {
        console.log('🔄 Board eliminado, no refrescando');
        return;
      }

      // Refrescar el board para mostrar los cambios
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleBoardCreated = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Board creado en tiempo real:', data.board);
      // Refrescar la lista de boards
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleBoardDeleted = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Board eliminado en tiempo real:', data.boardId);
      // Refrescar la lista de boards para remover el board eliminado
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleColumnsReordered = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Columnas reordenadas en tiempo real:', data);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Columnas Reordenadas',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, column modificada`
      });

      // Refrescar el board para mostrar el nuevo orden
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleCardsReordered = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('🔄 Tarjetas reordenadas en tiempo real:', data);

      // Generar notificación
      addNotification({
        type: 'info',
        title: 'Tarjetas Reordenadas',
        message: `Board: ${currentBoard?.name || 'Desconocido'}, card modificada`
      });

      // Refrescar el board para mostrar el nuevo orden
      if (onRefresh) {
        onRefresh();
      }
    };

    const handleUserJoined = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('👤 Usuario se unió:', data.socketId);
    };

            const handleUserLeft = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              console.log('👤 Usuario salió:', data.socketId);
            };

            const handleExportSuccess = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              console.log('✅ Exportación exitosa:', data);

              // Generar notificación de éxito
              addNotification({
                type: 'success',
                title: 'Exportación Exitosa',
                message: `Board: ${data.boardName}, Email: ${data.email} - ${data.message}`
              });
            };

            const handleExportError = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              console.log('❌ Error en exportación:', data);

              // Generar notificación de error
              addNotification({
                type: 'error',
                title: 'Error en Exportación',
                message: `Board: ${data.boardName}, Email: ${data.email} - ${data.message}`
              });
            };

            // Registrar listeners
            websocketService.on('card:created', handleCardCreated);
            websocketService.on('card:updated', handleCardUpdated);
            websocketService.on('card:moved', handleCardMoved);
            websocketService.on('card:deleted', handleCardDeleted);
            websocketService.on('cards:reordered', handleCardsReordered);
            websocketService.on('column:created', handleColumnCreated);
            websocketService.on('column:updated', handleColumnUpdated);
            websocketService.on('column:deleted', handleColumnDeleted);
            websocketService.on('columns:reordered', handleColumnsReordered);
            websocketService.on('board:created', handleBoardCreated);
            websocketService.on('board:updated', handleBoardUpdated);
            websocketService.on('board:deleted', handleBoardDeleted);
            websocketService.on('export:success', handleExportSuccess);
            websocketService.on('export:error', handleExportError);
            websocketService.on('user:joined', handleUserJoined);
            websocketService.on('user:left', handleUserLeft);

            // Cleanup al desmontar o cambiar board
            return () => {
              websocketService.off('card:created', handleCardCreated);
              websocketService.off('card:updated', handleCardUpdated);
              websocketService.off('card:moved', handleCardMoved);
              websocketService.off('card:deleted', handleCardDeleted);
              websocketService.off('cards:reordered', handleCardsReordered);
              websocketService.off('column:created', handleColumnCreated);
              websocketService.off('column:updated', handleColumnUpdated);
              websocketService.off('column:deleted', handleColumnDeleted);
              websocketService.off('columns:reordered', handleColumnsReordered);
              websocketService.off('board:created', handleBoardCreated);
              websocketService.off('board:updated', handleBoardUpdated);
              websocketService.off('board:deleted', handleBoardDeleted);
              websocketService.off('export:success', handleExportSuccess);
              websocketService.off('export:error', handleExportError);
              websocketService.off('user:joined', handleUserJoined);
              websocketService.off('user:left', handleUserLeft);

      if (boardId) {
        websocketService.leaveBoard(boardId);
      }
    };
  }, [boardId, onRefresh, addNotification, currentBoard?.name]);

  // Retornar estado de conexión y notificaciones para mostrar en UI
  return {
    isConnected: websocketService.isConnected(),
    currentBoardId: websocketService.getCurrentBoardId(),
    notifications,
    removeNotification,
  };
};
