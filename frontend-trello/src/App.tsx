import { BoardSelector } from "@/components/board-selector"
import { KanbanBoard } from "@/components/kanban-board"
import type { Board } from "@/types/kanban"
import { useState } from 'react'
import './App.css'

function App() {
  const [boards, setBoards] = useState<Board[]>([
    {
      id: "1",
      name: "My First Board",
      columns: [
        {
          id: "col-1",
          title: "To Do",
          cards: [
            {
              id: "card-1",
              name: "Design landing page",
              description: "Create wireframes and mockups for the new landing page",
            },
          ],
        },
        {
          id: "col-2",
          title: "In Progress",
          cards: [],
        },
        {
          id: "col-3",
          title: "Done",
          cards: [],
        },
      ],
    },
  ])
  const [currentBoardId, setCurrentBoardId] = useState<string>("1")

  const currentBoard = boards.find((b) => b.id === currentBoardId)

  const updateBoard = (updatedBoard: Board) => {
    setBoards(boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)))
  }

  const addBoard = (name: string) => {
    const newBoard: Board = {
      id: Date.now().toString(),
      name,
      columns: [],
    }
    setBoards([...boards, newBoard])
    setCurrentBoardId(newBoard.id)
  }

  const deleteBoard = (id: string) => {
    const filtered = boards.filter((b) => b.id !== id)
    setBoards(filtered)
    if (currentBoardId === id && filtered.length > 0) {
      setCurrentBoardId(filtered[0].id)
    }
  }

  const renameBoard = (id: string, newName: string) => {
    setBoards(boards.map((b) => (b.id === id ? { ...b, name: newName } : b)))
  }

  return (
    <div className="flex flex-col h-screen">
      <BoardSelector
        boards={boards}
        currentBoardId={currentBoardId}
        onSelectBoard={setCurrentBoardId}
        onAddBoard={addBoard}
        onDeleteBoard={deleteBoard}
        onRenameBoard={renameBoard}
      />
      {currentBoard && <KanbanBoard board={currentBoard} onUpdateBoard={updateBoard} />}
    </div>
  )
}

export default App
