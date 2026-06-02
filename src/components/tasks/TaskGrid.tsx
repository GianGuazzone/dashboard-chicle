'use client'
import { useState, useEffect } from 'react'
import { LayoutGrid, List, ChevronDown, ChevronRight } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskList } from './TaskList'
import { TaskDetail } from './TaskDetail'
import { TaskForm } from './TaskForm'
import { Modal } from '@/components/ui/Modal'
import { cn, priorityOrder } from '@/lib/utils'
import type { Task, Client } from '@/lib/types'

interface TaskGridProps {
  tasks: Task[]
  clients: Client[]
  onRefresh: () => void
  showViewToggle?: boolean
}

type ViewMode = 'cards' | 'list'

function isResolved(task: Task) {
  return task.estado === 'entregada' || task.estado === 'aprobada'
}

export function TaskGrid({ tasks, clients, onRefresh, showViewToggle = true }: TaskGridProps) {
  const [view, setView] = useState<ViewMode>('cards')
  const [selected, setSelected] = useState<Task | null>(null)
  const [editing, setEditing] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLocalTasks(tasks) }, [tasks])

  const handleStatusUpdate = (updated: Task) => {
    setLocalTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const active = [...localTasks.filter(t => !isResolved(t))].sort((a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad])
  const completed = [...localTasks.filter(t => isResolved(t))].sort((a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad])

  if (localTasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">No hay tareas que mostrar.</p>
      </div>
    )
  }

  const renderCards = (items: Task[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(task => (
        <TaskCard key={task.id} task={task} onClick={setSelected} onUpdate={handleStatusUpdate} />
      ))}
    </div>
  )

  return (
    <>
      {/* View toggle */}
      {showViewToggle && (
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('cards')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'cards' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <LayoutGrid size={13} />
              Cards
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                view === 'list' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <List size={13} />
              Lista
            </button>
          </div>
        </div>
      )}

      {/* Active tasks */}
      {active.length > 0 ? (
        view === 'cards'
          ? renderCards(active)
          : <TaskList tasks={active} clients={clients} onRefresh={onRefresh} />
      ) : (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Sin tareas activas.</p>
        </div>
      )}

      {/* Completed tasks — collapsible */}
      {completed.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setCompletedOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-3 group"
          >
            {completedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Completadas</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {completed.length}
            </span>
          </button>

          {completedOpen && (
            view === 'cards'
              ? renderCards(completed)
              : <TaskList tasks={completed} clients={clients} onRefresh={onRefresh} />
          )}
        </div>
      )}

      {/* Modals */}
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

      <Modal isOpen={!!selected && editing} onClose={() => setEditing(false)} title="Editar tarea" size="lg">
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
