"use client"

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/hooks/useNotifications'
import type { ExportBacklogRequest } from '@/services/exportService'
import { ExportService } from '@/services/exportService'
import { Download, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'

interface ExportBacklogDialogProps {
  isOpen: boolean
  onClose: () => void
  boardId: string
  boardName: string
}

export function ExportBacklogDialog({ 
  isOpen, 
  onClose, 
  boardId, 
  boardName 
}: ExportBacklogDialogProps) {
  const [email, setEmail] = useState('')
  const [customBoardName, setCustomBoardName] = useState(boardName)
  const [selectedFields, setSelectedFields] = useState({
    id: true,
    title: true,
    description: true,
    column: true,
    createdAt: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { addNotification } = useNotifications()

  const handleExport = async () => {
    if (!email.trim()) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Por favor ingresa un email válido'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const request: ExportBacklogRequest = {
        email: email.trim(),
        boardName: customBoardName.trim() || boardName,
        fields: Object.entries(selectedFields)
          .filter(([, selected]) => selected)
          .map(([field]) => field),
      }

      const response = await ExportService.exportBoardBacklog(boardId, request)
      
      addNotification({
        type: 'success',
        title: 'Exportación Iniciada',
        message: `Se ha iniciado la exportación del backlog. ID de solicitud: ${response.requestId}`
      })

      onClose()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de Exportación',
        message: error instanceof Error ? error.message : 'Error desconocido al exportar'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: string, checked: boolean) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Backlog
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email de destino *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Nombre del board */}
          <div className="space-y-2">
            <Label htmlFor="boardName">Nombre del board</Label>
            <Input
              id="boardName"
              placeholder="Nombre del board"
              value={customBoardName}
              onChange={(e) => setCustomBoardName(e.target.value)}
            />
          </div>

          {/* Campos a exportar */}
          <div className="space-y-2">
            <Label>Campos a exportar</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selectedFields).map(([field, selected]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selected}
                    onCheckedChange={(checked: boolean) => handleFieldChange(field, checked)}
                  />
                  <Label htmlFor={field} className="text-sm capitalize">
                    {field === 'createdAt' ? 'Fecha de creación' : 
                     field === 'id' ? 'ID' :
                     field === 'title' ? 'Título' :
                     field === 'description' ? 'Descripción' :
                     field === 'column' ? 'Columna' : field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">¿Cómo funciona?</p>
                <p className="mt-1">
                  Se generará un archivo CSV con todas las tarjetas del board y se enviará 
                  automáticamente al email especificado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
