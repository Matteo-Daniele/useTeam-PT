import { BoardSelector } from "@/components/board-selector"
import { KanbanBoard } from "@/components/kanban-board"
import { NotificationContainer } from "@/components/NotificationContainer"
import { kanbanService } from "@/services/kanbanService"
import type { Board, KanbanBoard as KanbanBoardType } from "@/types/kanban"
import { useEffect, useState } from 'react'
import './App.css'
import { useRealtime } from './hooks/useRealtime'

function App() {
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<KanbanBoardType | null>(null)
  const [currentBoardId, setCurrentBoardId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Integrar WebSocket para tiempo real
  const { isConnected, notifications, removeNotification } = useRealtime(currentBoardId, () => {
    // Refrescar tanto la lista de boards como el board actual
    loadBoards();
    if (currentBoardId) {
      loadCurrentBoard();
    }
  }, currentBoard);

  // Load boards on component mount
  useEffect(() => {
    loadBoards()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load current board when boardId changes
  useEffect(() => {
    if (currentBoardId) {
      loadCurrentBoard()
    }
  }, [currentBoardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadBoards = async () => {
    try {
      setLoading(true)
      setError(null)
      const boardsData = await kanbanService.getBoards()
      setBoards(boardsData)
      
      // Set first board as current if none selected
      if (boardsData.length > 0 && !currentBoardId) {
        setCurrentBoardId(boardsData[0].id)
        console.log(boardsData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boards')
    } finally {
      setLoading(false)
    }
  }
  

  const loadCurrentBoard = async () => {
    if (!currentBoardId) return
    
    try {
      setLoading(true)
      setError(null)
      const boardData = await kanbanService.getKanbanBoard(currentBoardId)
      setCurrentBoard(boardData)
    } catch (err) {
      // Si el board no existe (404), limpiar el estado
      if (err instanceof Error && err.message.includes('404')) {
        console.log('Board eliminado, limpiando estado')
        setCurrentBoard(null)
        setCurrentBoardId("")
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load board')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateBoard = async (updatedBoard: KanbanBoardType) => {
    try {
      // Update board info
      await kanbanService.updateBoard(updatedBoard.id, {
        name: updatedBoard.name,
        description: updatedBoard.description
      })
      
      // Reload boards list
      await loadBoards()
      
      // Update current board
      setCurrentBoard(updatedBoard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board')
    }
  }

  const addBoard = async (name: string) => {
    try {
      const newBoard = await kanbanService.createBoard({ name })
      await loadBoards()
      setCurrentBoardId(newBoard.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board')
    }
  }

  const deleteBoard = async (id: string) => {
    try {
      await kanbanService.deleteBoard(id)
      await loadBoards()
      
      // Select another board if current was deleted
      if (currentBoardId === id) {
        const remainingBoards = boards.filter(b => b.id !== id)
        if (remainingBoards.length > 0) {
          setCurrentBoardId(remainingBoards[0].id)
        } else {
          setCurrentBoardId("")
          setCurrentBoard(null)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board')
    }
  }

  const renameBoard = async (id: string, newName: string) => {
    try {
      await kanbanService.updateBoard(id, { name: newName })
      await loadBoards()
      
      // Update current board if it's the one being renamed
      if (currentBoard && currentBoard.id === id) {
        setCurrentBoard({ ...currentBoard, name: newName })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename board')
    }
  }

  if (loading && boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Indicador de conexión WebSocket */}
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Tiempo real activo' : 'Sin conexión en tiempo real'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Los cambios se sincronizan automáticamente entre usuarios
        </div>
      </div>
      
      <BoardSelector
        boards={boards}
        currentBoardId={currentBoardId}
        onSelectBoard={setCurrentBoardId}
        onAddBoard={addBoard}
        onDeleteBoard={deleteBoard}
        onRenameBoard={renameBoard}
      />
      {currentBoard && (
        <KanbanBoard 
          board={currentBoard} 
          onUpdateBoard={updateBoard}
          onRefreshBoard={loadCurrentBoard}
        />
      )}
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}

export default App
