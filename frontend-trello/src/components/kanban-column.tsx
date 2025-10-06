"use client"

import type React from "react"

import { KanbanCard } from "@/components/kanban-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Card, Column } from "@/types/kanban"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface KanbanColumnProps {
  column: Column
  onUpdateColumn: (column: Column) => void
  onDeleteColumn: () => void
  onDragStart: (cardId: string, columnId: string) => void
  onDrop: (columnId: string) => void
}

export function KanbanColumn({ column, onUpdateColumn, onDeleteColumn, onDragStart, onDrop }: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(column.title)

  const handleTitleSave = () => {
    if (title.trim()) {
      onUpdateColumn({ ...column, title: title.trim() })
    }
    setIsEditingTitle(false)
  }

  const addCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      name: "New Task",
      description: "",
    }
    onUpdateColumn({
      ...column,
      cards: [...column.cards, newCard],
    })
  }

  const updateCard = (cardId: string, updatedCard: Card) => {
    onUpdateColumn({
      ...column,
      cards: column.cards.map((card) => (card.id === cardId ? updatedCard : card)),
    })
  }

  const deleteCard = (cardId: string) => {
    onUpdateColumn({
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnColumn = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(column.id)
  }

  return (
    <div
      className="flex flex-col w-80 flex-shrink-0 bg-card rounded-lg border border-border"
      onDragOver={handleDragOver}
      onDrop={handleDropOnColumn}
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
            {column.title}
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

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            columnId={column.id}
            onUpdateCard={(updated) => updateCard(card.id, updated)}
            onDeleteCard={() => deleteCard(card.id)}
            onDragStart={onDragStart}
          />
        ))}
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
