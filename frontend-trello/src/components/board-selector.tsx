"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import type { Board } from "../types/kanban"

interface BoardSelectorProps {
  boards: Board[]
  currentBoardId: string
  onSelectBoard: (id: string) => void
  onAddBoard: (name: string) => void
  onDeleteBoard: (id: string) => void
  onRenameBoard: (id: string, newName: string) => void
}

export function BoardSelector({
  boards,
  currentBoardId,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
  onRenameBoard,
}: BoardSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [renameBoardName, setRenameBoardName] = useState("")

  const currentBoard = boards.find((b) => b.id === currentBoardId)

  const handleAddBoard = () => {
    if (newBoardName.trim()) {
      onAddBoard(newBoardName.trim())
      setNewBoardName("")
      setIsAddDialogOpen(false)
    }
  }

  const handleRenameBoard = () => {
    if (renameBoardName.trim() && currentBoard) {
      onRenameBoard(currentBoard.id, renameBoardName.trim())
      setRenameBoardName("")
      setIsRenameDialogOpen(false)
    }
  }

  const handleDeleteBoard = () => {
    if (currentBoard && boards.length > 1) {
      onDeleteBoard(currentBoard.id)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kanban</h1>

          <div className="flex items-center gap-2 flex-1">
            <Select value={currentBoardId} onValueChange={onSelectBoard}>
              <SelectTrigger className="w-64 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setRenameBoardName(currentBoard?.name || "")
                setIsRenameDialogOpen(true)
              }}
              className="h-9 w-9"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {boards.length > 1 && (
              <Button variant="ghost" size="icon" onClick={handleDeleteBoard} className="h-9 w-9">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Board
          </Button>
        </div>
      </header>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Board name"
            value={newBoardName}
            onChange={(e: any) => setNewBoardName(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && handleAddBoard()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBoard}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Board name"
            value={renameBoardName}
            onChange={(e: any) => setRenameBoardName(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && handleRenameBoard()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameBoard}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
