'use client'
import { Calendar, ExternalLink, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { StatusDropdown } from './StatusDropdown'
import { cn, formatDate, getTaskUrgency, priorityColors, priorityDot, statusColors } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onUpdate?: (task: Task) => void
}

export function TaskCard({ task, onClick, onUpdate }: TaskCardProps) {
  const urgency = getTaskUrgency(task)

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all group',
        urgency === 'overdue' && 'border-red-200 bg-red-50/30',
        urgency === 'urgent' && 'border-orange-200 bg-orange-50/20',
        urgency === 'resolved' && 'border-emerald-100 opacity-75',
        urgency === 'normal' && 'border-slate-200 hover:border-violet-200',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={cn(
          'text-sm font-semibold text-slate-800 leading-snug group-hover:text-violet-700 transition-colors line-clamp-2',
          urgency === 'resolved' && 'line-through text-slate-400'
        )}>
          {task.titulo}
        </h3>
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', priorityDot[task.prioridad])} />
      </div>

      {task.descripcion && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.descripcion}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
        {onUpdate
          ? <StatusDropdown task={task} onUpdate={onUpdate} />
          : <Badge className={statusColors[task.estado]}>{task.estado}</Badge>
        }
        <Badge className={priorityColors[task.prioridad]}>{task.prioridad}</Badge>
        {task.tipo_de_tarea && (
          <Badge className="bg-slate-50 text-slate-600 border-slate-200">{task.tipo_de_tarea}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          {task.deadline && (
            <>
              <Calendar size={11} />
              <span className={cn(
                urgency === 'overdue' && 'text-red-500 font-medium',
                urgency === 'urgent' && 'text-orange-500 font-medium',
              )}>
                {formatDate(task.deadline)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.tiempo_estimado && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {task.tiempo_estimado}
            </span>
          )}
          {task.link_externo && <ExternalLink size={11} className="text-violet-400" />}
        </div>
      </div>

      {task.clientes && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.clientes.color }} />
          <span className="text-xs text-slate-500">{task.clientes.nombre}</span>
        </div>
      )}
    </div>
  )
}
