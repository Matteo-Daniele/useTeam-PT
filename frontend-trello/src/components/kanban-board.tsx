"use client"

import { KanbanColumn } from "@/components/kanban-column"
import { Button } from "@/components/ui/button"
import type { Board, Column } from "@/types/kanban"
import { Plus } from "lucide-react"
import { useState } from "react"

interface KanbanBoardProps {
  board: Board
  onUpdateBoard: (board: Board) => void
}

export function KanbanBoard({ board, onUpdateBoard }: KanbanBoardProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [draggedFromColumnId, setDraggedFromColumnId] = useState<string | null>(null)

  const addColumn = () => {
    const newColumn: Column = {
      id: Date.now().toString(),
      title: "New Column",
      cards: [],
    }
    onUpdateBoard({
      ...board,
      columns: [...board.columns, newColumn],
    })
  }

  const updateColumn = (columnId: string, updatedColumn: Column) => {
    onUpdateBoard({
      ...board,
      columns: board.columns.map((col) => (col.id === columnId ? updatedColumn : col)),
    })
  }

  const deleteColumn = (columnId: string) => {
    onUpdateBoard({
      ...board,
      columns: board.columns.filter((col) => col.id !== columnId),
    })
  }

  const handleDragStart = (cardId: string, columnId: string) => {
    setDraggedCardId(cardId)
    setDraggedFromColumnId(columnId)
  }

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCardId || !draggedFromColumnId) return

    const sourceColumn = board.columns.find((col) => col.id === draggedFromColumnId)
    const targetColumn = board.columns.find((col) => col.id === targetColumnId)

    if (!sourceColumn || !targetColumn) return

    const draggedCard = sourceColumn.cards.find((card) => card.id === draggedCardId)
    if (!draggedCard) return

    // Remove from source
    const newSourceCards = sourceColumn.cards.filter((card) => card.id !== draggedCardId)

    // Add to target
    const newTargetCards =
      draggedFromColumnId === targetColumnId ? newSourceCards : [...targetColumn.cards, draggedCard]

    onUpdateBoard({
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === draggedFromColumnId) {
          return { ...col, cards: newSourceCards }
        }
        if (col.id === targetColumnId && draggedFromColumnId !== targetColumnId) {
          return { ...col, cards: newTargetCards }
        }
        return col
      }),
    })

    setDraggedCardId(null)
    setDraggedFromColumnId(null)
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div className="flex gap-4 h-full">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onUpdateColumn={(updated) => updateColumn(column.id, updated)}
            onDeleteColumn={() => deleteColumn(column.id)}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}

        <div className="flex-shrink-0">
          <Button variant="outline" onClick={addColumn} className="h-12 w-64 border-dashed bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
    </div>
  )
}
