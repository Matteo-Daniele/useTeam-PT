"use client"

import { KanbanColumn } from "@/components/kanban-column"
import { Button } from "@/components/ui/button"
import { kanbanService } from "@/services/kanbanService"
import type { KanbanBoard as KanbanBoardType, KanbanCard, KanbanColumn as KanbanColumnType } from "@/types/kanban"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface KanbanBoardProps {
  board: KanbanBoardType
  onUpdateBoard: (board: KanbanBoardType) => void
  onRefreshBoard: () => void
}

export function KanbanBoard({ board, onRefreshBoard }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<{ type: string; item: KanbanColumnType | KanbanCard } | null>(null)
  const [newOrderColumn, setNewOrderColumn] = useState<KanbanColumnType[]>([...board.columns])

  useEffect(() => {
    setNewOrderColumn([...board.columns])
  }, [board])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const columnsId = useMemo(() => board.columns.map((col: KanbanColumnType) => col.id), [board.columns])

  const addColumn = async () => {
    try {
      await kanbanService.createColumn({
        name: "New Column",
        boardId: board.id
      })
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to create column:', error)
    }
  }

  const updateColumn = async (columnId: string, updatedColumn: KanbanColumnType) => {
    try {
      await kanbanService.updateColumn(columnId, { name: updatedColumn.name })
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to update column:', error)
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      await kanbanService.deleteColumn(columnId)
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to delete column:', error)
    }
  }

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the active item data
    const activeColumn = board.columns.find((col: KanbanColumnType) => col.id === active.id)
    if (activeColumn) {
      setActiveData({ type: "Column", item: activeColumn })
      return
    }
    
    // Check if it's a card
    for (const column of board.columns) {
      const activeCard = column.cards.find((card: KanbanCard) => card.id === active.id)
      if (activeCard) {
        setActiveData({ type: "Card", item: activeCard })
        return
      }
    }
  }

  /**
   * Maneja el final del drag and drop para columnas y tarjetas
   * 
   * Este es el método más complejo del sistema de drag and drop. Maneja dos casos:
   * 1. Reordenamiento de columnas (arrastrar columnas a diferentes posiciones)
   * 2. Movimiento de tarjetas (dentro de la misma columna o entre columnas)
   * 
   * Utiliza "optimistic UI" - actualiza la interfaz inmediatamente y luego
   * sincroniza con el servidor. Si hay error, refresca para revertir cambios.
   * 
   * @param event - Evento de drag end de dnd-kit con información de origen y destino
   */
  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    // Limpiar estado de drag activo
    setActiveId(null)
    setActiveData(null)

    // Validar que hay un destino válido y no es el mismo elemento
    if (!over || active.id === over.id) return

    try {
      // CASO 1: REORDENAMIENTO DE COLUMNAS
      // Se activa cuando se arrastra una columna a otra posición
      if (activeData?.type === "Column") {
        // Encontrar índices de origen y destino
        const oldIndex = board.columns.findIndex((col: KanbanColumnType) => col.id === active.id)
        const newIndex = board.columns.findIndex((col: KanbanColumnType) => col.id === over.id)
        
        console.log('Reordering columns:', oldIndex, 'to', newIndex);
        
        // Validar que ambos índices son válidos y diferentes
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // OPTIMISTIC UI: Reordenar columnas inmediatamente en la interfaz
          // arrayMove es una función de dnd-kit que mueve elementos en un array
          const reordered = arrayMove(board.columns, oldIndex, newIndex)
          
          // Preparar datos para la API - cada columna necesita su nuevo orden
          const columnOrders = reordered.map((col, index) => ({
            columnId: col.id,
            order: index
          }))

          // Actualizar estado local para mostrar cambios inmediatamente
          setNewOrderColumn(reordered);
          
          // Sincronizar con el servidor
          await kanbanService.reorderColumns(board.id, columnOrders)
          
          // Refrescar para asegurar sincronización completa
          onRefreshBoard()
        }
      }

      // CASO 2: MOVIMIENTO DE TARJETAS
      // Se activa cuando se arrastra una tarjeta a otra posición o columna
      if (activeData?.type === "Card") {
        const activeCard = activeData.item as KanbanCard
        
        // PASO 1: Encontrar la columna de origen
        // Busca la columna que contiene la tarjeta que se está arrastrando
        const sourceColumn = board.columns.find((col: KanbanColumnType) => 
          col.cards.some((card: KanbanCard) => card.id === active.id)
        )
        
        // PASO 2: Encontrar la columna de destino
        // Este es el paso más complejo porque el destino puede ser:
        // - Una columna (si se arrastra a una columna vacía)
        // - Una tarjeta (si se arrastra sobre otra tarjeta)
        // - Un contenedor de tarjetas (si se arrastra a un área vacía)
        
        let targetColumn = board.columns.find((col: KanbanColumnType) => col.id === over.id)
        
        // Si over.id es una tarjeta, encontrar su columna
        if (!targetColumn) {
          targetColumn = board.columns.find((col: KanbanColumnType) => 
            col.cards.some((card: KanbanCard) => card.id === over.id)
          )
        }
        
        // Si over.id es un contenedor droppable (columna vacía), resolver por ID del contenedor
        // Los contenedores tienen formato "cards:columnId" para identificar columnas vacías
        if (!targetColumn && typeof over.id === 'string' && over.id.startsWith('cards:')) {
          const containerColumnId = over.id.split(':')[1]
          targetColumn = board.columns.find((col: KanbanColumnType) => col.id === containerColumnId)
        }
        
        if (sourceColumn && targetColumn) {
          if (sourceColumn.id === targetColumn.id) {
            // Card reordering within the same column
            const oldIndex = sourceColumn.cards.findIndex((card: KanbanCard) => card.id === active.id)
            let newIndex = sourceColumn.cards.findIndex((card: KanbanCard) => card.id === over.id)
            
            // If over.id is not a card but a droppable container, insert at the end
            if (newIndex === -1 && typeof over.id === 'string' && over.id.startsWith('cards:')) {
              newIndex = sourceColumn.cards.length - 1 // Insert at the end
            }
            
            // Ensure we have valid indices
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              console.log('Reordering cards within column:', {
                columnId: sourceColumn.id,
                oldIndex,
                newIndex,
                activeId: active.id,
                overId: over.id
              });
              
              // Use dnd-kit arrayMove to compute the new order robustly
              const currentIds = sourceColumn.cards.map((c: KanbanCard) => c.id)
              const reorderedIds = arrayMove(currentIds, oldIndex, newIndex)
              const cardOrders = reorderedIds.map((id: string, idx: number) => ({ cardId: id, order: idx }))
              
              console.log('Card orders to send:', cardOrders);

              // Update local state immediately for optimistic UI
              const updatedColumns = newOrderColumn.map(col => {
                if (col.id === sourceColumn.id) {
                  const reorderedCards = reorderedIds.map(id => 
                    sourceColumn.cards.find(card => card.id === id)!
                  ).filter(Boolean)
                  return { ...col, cards: reorderedCards }
                }
                return col
              })
              setNewOrderColumn(updatedColumns)

              await kanbanService.reorderCards(sourceColumn.id, cardOrders, board.id)
              onRefreshBoard()
            }
          } else {
            // Card movement between columns
            // Update local state immediately for optimistic UI
            const updatedColumns = newOrderColumn.map(col => {
              if (col.id === sourceColumn.id) {
                // Remove card from source column
                return { ...col, cards: col.cards.filter(card => card.id !== activeCard.id) }
              } else if (col.id === targetColumn.id) {
                // Add card to target column
                return { ...col, cards: [...col.cards, activeCard] }
              }
              return col
            })
            setNewOrderColumn(updatedColumns)

            await kanbanService.moveCard(
              activeCard.id,
              targetColumn.id,
              board.id,
              targetColumn.cards.length
            )
            onRefreshBoard()
          }
        }
      }
    } catch (error) {
      console.error('Failed to handle drag end:', error)
    }
  }

  const onDragOver = () => {
    // We don't need to do anything here since we handle everything in onDragEnd
    // This prevents multiple API calls during drag
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-4 h-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
        <SortableContext items={columnsId}>
            {newOrderColumn.map((column: KanbanColumnType) => (
            <KanbanColumn
              key={column.id}
              column={column}
                boardId={board.id}
              onUpdateColumn={(updated) => updateColumn(column.id, updated)}
              onDeleteColumn={() => deleteColumn(column.id)}
                onRefreshBoard={onRefreshBoard}
            />
          ))}
        </SortableContext>
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={addColumn} className="h-12 w-64 border-dashed bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
          <DragOverlay>
                {activeId && activeData ? (
                  activeData.type === "Column" ? (
                    <div className="flex flex-col w-80 flex-shrink-0 bg-card rounded-lg border border-border opacity-90">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          {(activeData.item as KanbanColumnType).name}
                                      <span className="text-xs text-muted-foreground">({(activeData.item as KanbanColumnType).cards.length})</span>
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background rounded-md border border-border p-3 shadow-lg">
                      <h4 className="text-sm font-medium text-foreground leading-snug">{(activeData.item as KanbanCard).title}</h4>
                      {(activeData.item as KanbanCard).description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{(activeData.item as KanbanCard).description}</p>
                      )}
                    </div>
                  )
                ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
