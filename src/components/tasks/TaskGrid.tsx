'use client'
import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { TaskForm } from './TaskForm'
import { Modal } from '@/components/ui/Modal'
import type { Task, Client } from '@/lib/types'
import { priorityOrder } from '@/lib/utils'

interface TaskGridProps {
  tasks: Task[]
  clients: Client[]
  onRefresh: () => void
}

export function TaskGrid({ tasks, clients, onRefresh }: TaskGridProps) {
  const [selected, setSelected] = useState<Task | null>(null)
  const [editing, setEditing] = useState(false)

  const sorted = [...tasks].sort((a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad])

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-sm">No hay tareas que mostrar.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map(task => (
          <TaskCard key={task.id} task={task} onClick={setSelected} />
        ))}
      </div>

      <Modal
        isOpen={!!selected && !editing}
        onClose={() => setSelected(null)}
        title={selected?.titulo || ''}
        size="md"
      >
        {selected && (
          <TaskDetail
            task={selected}
            onEdit={() => setEditing(true)}
            onDelete={() => { setSelected(null); onRefresh() }}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!selected && editing}
        onClose={() => setEditing(false)}
        title="Editar tarea"
        size="lg"
      >
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
