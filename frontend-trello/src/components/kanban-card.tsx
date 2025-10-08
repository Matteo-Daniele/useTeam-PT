"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import type { KanbanCard as KanbanCardType } from "../types/kanban"

interface KanbanCardProps {
  card: KanbanCardType
  columnId: string
  onUpdateCard: (card: KanbanCardType) => void
  onDeleteCard: () => void
}

export function KanbanCard({ card, columnId, onUpdateCard, onDeleteCard }: KanbanCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [name, setName] = useState(card.title)
  const [description, setDescription] = useState(card.description)

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
      columnId,
    },
    disabled: isEditDialogOpen // Deshabilitar drag cuando se está editando
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    onUpdateCard({
      ...card,
      title: name.trim() || "Untitled",
      description: description.trim(),
    })
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(!isEditDialogOpen ? listeners : {})} // Solo aplicar listeners cuando NO está editando
        className={`bg-background rounded-md border border-border p-3 hover:shadow-md transition-shadow group ${
          isEditDialogOpen ? 'cursor-default' : 'cursor-move'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-foreground leading-snug flex-1">{card.title}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className="h-6 w-6">
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDeleteCard} className="h-6 w-6">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {card.description && <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input placeholder="Card name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
