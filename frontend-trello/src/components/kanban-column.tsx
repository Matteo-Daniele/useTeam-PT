"use client"

import { KanbanCard } from "@/components/kanban-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { kanbanService } from "@/services/kanbanService"
import type { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType } from "@/types/kanban"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

interface KanbanColumnProps {
  column: KanbanColumnType
  boardId: string
  onUpdateColumn: (column: KanbanColumnType) => void
  onDeleteColumn: () => void
  onRefreshBoard: () => void
}

export function KanbanColumn({ column, boardId, onUpdateColumn, onDeleteColumn, onRefreshBoard }: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(column.name)

  const { setNodeRef, attributes, listeners, transform, transition, isDragging }  = 
  useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: isEditingTitle // Deshabilitar drag cuando se está editando
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditingTitle ? 'default' : 'grab' // Cambiar cursor cuando está editando
  }

  const cardIds = useMemo(() => column.cards.map((card: KanbanCardType) => card.id), [column.cards])

  // Make the cards list area a droppable target so cards can be dropped into empty columns
  const { setNodeRef: setCardsDroppableRef } = useDroppable({
    id: `cards:${column.id}`,
    data: { type: 'CardsContainer', columnId: column.id }
  })


  const handleTitleSave = async () => {
    if (title.trim()) {
      try {
        await kanbanService.updateColumn(column.id, { name: title.trim() })
        onUpdateColumn({ ...column, name: title.trim() })
      } catch (error) {
        console.error('Failed to update column:', error)
      }
    }
    setIsEditingTitle(false)
  }

  const addCard = async () => {
    try {
      await kanbanService.createCard({
        title: "New Task",
        description: "",
        boardId: boardId,
        columnId: column.id
      })
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  const updateCard = async (cardId: string, updatedCard: KanbanCardType) => {
    try {
      await kanbanService.updateCard(cardId, {
        title: updatedCard.title,
        description: updatedCard.description
      })
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to update card:', error)
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      await kanbanService.deleteCard(cardId)
      onRefreshBoard()
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isEditingTitle ? listeners : {})} // Solo aplicar listeners cuando NO está editando
      className={`flex flex-col w-80 flex-shrink-0 bg-card rounded-lg border border-border ${
        isEditingTitle ? 'cursor-default' : 'cursor-move'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            className="h-8 text-sm font-medium"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            {column.name}
            <span className="text-xs text-muted-foreground">({column.cards.length})</span>
          </h3>
        )}

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)} className="h-7 w-7">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDeleteColumn} className="h-7 w-7">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div ref={setCardsDroppableRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              {column.cards.map((card: KanbanCardType) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onUpdateCard={(updated) => updateCard(card.id, updated)}
              onDeleteCard={() => deleteCard(card.id)}
            />
          ))}
        </SortableContext>
      </div>

      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          onClick={addCard}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
    </div>
  )
}
