'use client'
import { useState } from 'react'
import { ExternalLink, Edit2, Trash2, Calendar, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, priorityColors, statusColors } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface TaskDetailProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function TaskDetail({ task, onEdit, onDelete, onClose }: TaskDetailProps) {
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta tarea?')) return
    setDeleting(true)
    await supabase.from('tareas').delete().eq('id', task.id)
    setDeleting(false)
    onDelete()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge className={statusColors[task.estado]}>{task.estado}</Badge>
        <Badge className={priorityColors[task.prioridad]}>{task.prioridad}</Badge>
        {task.tipo_de_tarea && <Badge className="bg-slate-50 text-slate-600 border-slate-200">{task.tipo_de_tarea}</Badge>}
      </div>

      {task.descripcion && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Descripción</p>
          <p className="text-sm text-slate-700">{task.descripcion}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12} />Deadline</p>
          <p className="text-slate-700">{formatDate(task.deadline)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Clock size={12} />Tiempo estimado</p>
          <p className="text-slate-700 capitalize">{task.tiempo_estimado}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Creada</p>
          <p className="text-slate-700">{formatDate(task.created_at)}</p>
        </div>
        {task.fecha_de_resolucion && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Resuelta</p>
            <p className="text-slate-700">{formatDate(task.fecha_de_resolucion)}</p>
          </div>
        )}
        {task.clientes && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><User size={12} />Cliente</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.clientes.color }} />
              <p className="text-slate-700">{task.clientes.nombre}</p>
            </div>
          </div>
        )}
      </div>

      {task.notas && (
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-medium text-slate-500 mb-1">Notas</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.notas}</p>
        </div>
      )}

      {task.link_externo && (
        <a href={task.link_externo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700">
          <ExternalLink size={14} />
          Ver enlace externo
        </a>
      )}

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 size={14} />
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
        <Button size="sm" onClick={onEdit}>
          <Edit2 size={14} />
          Editar
        </Button>
      </div>
    </div>
  )
}
