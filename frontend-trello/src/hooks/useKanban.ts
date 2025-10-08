import { useCallback, useEffect } from 'react';
import { websocketService } from '../services/websocket.service';
import { useKanbanStore } from '../store/kanban.store';

/**
 * Hook personalizado para manejar la lógica de Kanban
 * Combina el store con WebSockets y efectos de React
 */
export const useKanban = () => {
  const store = useKanbanStore();

  // Conectar WebSocket al montar el componente
  useEffect(() => {
    websocketService.connect();
    store.setConnected(websocketService.isConnected());
    
    // Configurar listeners de WebSocket
    store.setupWebSocketListeners();

    // Cleanup al desmontar
    return () => {
      store.cleanupWebSocketListeners();
      websocketService.disconnect();
    };
  }, []);

  // Monitorear cambios en la conexión WebSocket
  useEffect(() => {
    const checkConnection = () => {
      store.setConnected(websocketService.isConnected());
    };

    // Verificar conexión cada 5 segundos
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para cargar datos de un board
  const loadBoard = useCallback(async (boardId: string) => {
    try {
      store.setLoading(true);
      store.setError(null);

      // Unirse al board en WebSocket
      store.joinBoard(boardId);

      // Simular datos de prueba para demostrar WebSocket
      const mockBoard = {
        id: boardId,
        name: `Board ${boardId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockColumns = [
        {
          id: 'col-1',
          boardId: boardId,
          name: 'To Do',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'col-2',
          boardId: boardId,
          name: 'In Progress',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'col-3',
          boardId: boardId,
          name: 'Done',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCards = [
        {
          id: 'card-1',
          boardId: boardId,
          columnId: 'col-1',
          title: 'Tarea de prueba',
          description: 'Esta es una tarea de prueba',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Establecer datos en el store
      store.setCurrentBoard(mockBoard);
      store.setColumns(mockColumns);
      store.setCards(mockCards);
      
      store.setLoading(false);
      console.log(`Board ${boardId} cargado con datos de prueba`);
    } catch (error) {
      console.error('Error cargando board:', error);
      store.setError('Error al cargar el board');
      store.setLoading(false);
    }
  }, []);

  // Función para crear una tarjeta
  const createCard = useCallback(async (cardData: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
  }) => {
    try {
      store.setLoading(true);
      store.setError(null);

      // Aquí harías la llamada a la API
      // const newCard = await api.createCard(cardData);
      
      // Por ahora, simulamos la creación
      const newCard = {
        id: Date.now().toString(),
        ...cardData,
        description: cardData.description || '',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.addCard(newCard);
      store.setLoading(false);
    } catch (error) {
      console.error('Error creando tarjeta:', error);
      store.setError('Error al crear la tarjeta');
      store.setLoading(false);
    }
  }, []);

  // Función para mover una tarjeta
  const moveCard = useCallback(async (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => {
    try {
      // Aplicar cambio optimista
      store.moveCard(cardId, fromColumnId, toColumnId, newOrder);

      // Aquí harías la llamada a la API
      // await api.moveCard({ cardId, toColumnId, newOrder });
      
      console.log(`Moviendo tarjeta ${cardId} a columna ${toColumnId}`);
    } catch (error) {
      console.error('Error moviendo tarjeta:', error);
      store.setError('Error al mover la tarjeta');
      // Aquí podrías revertir el cambio optimista
    }
  }, []);

  // Función para actualizar una tarjeta
  const updateCard = useCallback(async (cardId: string, updates: {
    title?: string;
    description?: string;
  }) => {
    try {
      // Aplicar cambio optimista
      const currentCard = store.cards.find(c => c.id === cardId);
      if (currentCard) {
        const updatedCard = { ...currentCard, ...updates, updatedAt: new Date() };
        store.updateCard(updatedCard);
      }

      // Aquí harías la llamada a la API
      // await api.updateCard(cardId, updates);
      
      console.log(`Actualizando tarjeta ${cardId}:`, updates);
    } catch (error) {
      console.error('Error actualizando tarjeta:', error);
      store.setError('Error al actualizar la tarjeta');
    }
  }, []);

  // Función para eliminar una tarjeta
  const deleteCard = useCallback(async (cardId: string) => {
    try {
      // Aplicar cambio optimista
      store.removeCard(cardId);

      // Aquí harías la llamada a la API
      // await api.deleteCard(cardId);
      
      console.log(`Eliminando tarjeta ${cardId}`);
    } catch (error) {
      console.error('Error eliminando tarjeta:', error);
      store.setError('Error al eliminar la tarjeta');
    }
  }, []);

  // Función para crear una columna
  const createColumn = useCallback(async (columnData: {
    boardId: string;
    name: string;
  }) => {
    try {
      store.setLoading(true);
      store.setError(null);

      // Aquí harías la llamada a la API
      // const newColumn = await api.createColumn(columnData);
      
      // Por ahora, simulamos la creación
      const newColumn = {
        id: Date.now().toString(),
        ...columnData,
        order: store.columns.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.addColumn(newColumn);
      store.setLoading(false);
    } catch (error) {
      console.error('Error creando columna:', error);
      store.setError('Error al crear la columna');
      store.setLoading(false);
    }
  }, []);

  // Función para actualizar una columna
  const updateColumn = useCallback(async (columnId: string, updates: {
    name?: string;
  }) => {
    try {
      // Aplicar cambio optimista
      const currentColumn = store.columns.find(c => c.id === columnId);
      if (currentColumn) {
        const updatedColumn = { ...currentColumn, ...updates, updatedAt: new Date() };
        store.updateColumn(updatedColumn);
      }

      // Aquí harías la llamada a la API
      // await api.updateColumn(columnId, updates);
      
      console.log(`Actualizando columna ${columnId}:`, updates);
    } catch (error) {
      console.error('Error actualizando columna:', error);
      store.setError('Error al actualizar la columna');
    }
  }, []);

  // Función para eliminar una columna
  const deleteColumn = useCallback(async (columnId: string) => {
    try {
      // Aplicar cambio optimista
      store.removeColumn(columnId);

      // Aquí harías la llamada a la API
      // await api.deleteColumn(columnId);
      
      console.log(`Eliminando columna ${columnId}`);
    } catch (error) {
      console.error('Error eliminando columna:', error);
      store.setError('Error al eliminar la columna');
    }
  }, []);

  return {
    // Estado
    ...store,
    
    // Acciones
    loadBoard,
    createCard,
    moveCard,
    updateCard,
    deleteCard,
    createColumn,
    updateColumn,
    deleteColumn,
  };
};
