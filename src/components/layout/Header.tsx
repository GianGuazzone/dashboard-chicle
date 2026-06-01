'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from '@/components/tasks/TaskForm'
import type { Client } from '@/lib/types'

interface HeaderProps {
  title: string
  subtitle?: string
  clients: Client[]
  defaultClientId?: string
  onTaskCreated?: () => void
}

export function Header({ title, subtitle, clients, defaultClientId, onTaskCreated }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} />
          Nueva tarea
        </Button>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nueva tarea" size="lg">
        <TaskForm
          clients={clients}
          defaultClientId={defaultClientId}
          onSuccess={() => { setOpen(false); onTaskCreated?.() }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
