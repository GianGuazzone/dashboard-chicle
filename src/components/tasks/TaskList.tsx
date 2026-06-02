'use client'
import { useState, useEffect } from 'react'
import { ExternalLink, Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { StatusDropdown } from './StatusDropdown'
import { Modal } from '@/components/ui/Modal'
import { TaskDetail } from './TaskDetail'
import { TaskForm } from './TaskForm'
import { cn, formatDate, getTaskUrgency, priorityColors, priorityDot } from '@/lib/utils'
import type { Task, Client } from '@/lib/types'
import { priorityOrder } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  clients: Client[]
  onRefresh: () => void
}

export function TaskList({ tasks, clients, onRefresh }: TaskListProps) {
  const [selected, setSelected] = useState<Task | null>(null)
  const [editing, setEditing] = useState(false)
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLocalTasks(tasks) }, [tasks])

  const handleStatusUpdate = (updated: Task) => {
    setLocalTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const sorted = [...localTasks].sort((a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad])

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">No hay tareas que mostrar.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Título</span>
          <span>Cliente</span>
          <span>Estado</span>
          <span>Prioridad</span>
          <span>Deadline</span>
          <span>Tiempo</span>
          <span className="w-16" />
        </div>

        {/* Rows */}
        {sorted.map((task, i) => {
          const urgency = getTaskUrgency(task)
          const isResolved = task.estado === 'entregada' || task.estado === 'aprobada'
          return (
            <div
              key={task.id}
              className={cn(
                'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center text-sm border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors group',
                urgency === 'overdue' && 'bg-red-50/30 hover:bg-red-50/50',
                urgency === 'urgent' && 'bg-orange-50/20 hover:bg-orange-50/40',
                i % 2 === 0 && urgency === 'normal' && 'bg-white',
              )}
            >
              {/* Title */}
              <button
                onClick={() => setSelected(task)}
                className={cn(
                  'text-left font-medium text-slate-800 hover:text-violet-700 transition-colors truncate flex items-center gap-2',
                  isResolved && 'line-through text-slate-400'
                )}
              >
                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityDot[task.prioridad])} />
                <span className="truncate">{task.titulo}</span>
                {task.link_externo && <ExternalLink size={11} className="text-slate-300 flex-shrink-0" />}
              </button>

              {/* Client */}
              <div className="flex items-center gap-1.5 min-w-0">
                {task.clientes && (
                  <>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.clientes.color }} />
                    <span className="text-slate-500 truncate text-xs">{task.clientes.nombre}</span>
                  </>
                )}
              </div>

              {/* Status */}
              <div>
                <StatusDropdown task={task} onUpdate={handleStatusUpdate} />
              </div>

              {/* Priority */}
              <div>
                <Badge className={cn(priorityColors[task.prioridad], 'whitespace-nowrap')}>
                  {task.prioridad}
                </Badge>
              </div>

              {/* Deadline */}
              <span className={cn(
                'text-xs',
                urgency === 'overdue' && 'text-red-500 font-semibold',
                urgency === 'urgent' && 'text-orange-500 font-semibold',
                urgency === 'normal' && 'text-slate-500',
                urgency === 'resolved' && 'text-slate-400',
              )}>
                {formatDate(task.deadline)}
              </span>

              {/* Duration */}
              <span className="text-xs text-slate-400 capitalize">{task.tiempo_estimado}</span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-16 justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(task); setEditing(true) }}
                  className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={!!selected && !editing} onClose={() => setSelected(null)} title={selected?.titulo || ''} size="md">
        {selected && (
          <TaskDetail
            task={selected}
            onEdit={() => setEditing(true)}
            onDelete={() => { setSelected(null); onRefresh() }}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!selected && editing} onClose={() => { setEditing(false) }} title="Editar tarea" size="lg">
        {selected && (
          <TaskForm
            clients={clients}
            task={selected}
            onSuccess={() => { setEditing(false); setSelected(null); onRefresh() }}
            onCancel={() => setEditing(false)}
          />
        )}
      </Modal>
    </>
  )
}
