'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Client, Task, TaskPriority, TaskStatus, TaskDuration } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface TaskFormProps {
  clients: Client[]
  task?: Task
  defaultClientId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function TaskForm({ clients, task, defaultClientId, onSuccess, onCancel }: TaskFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    cliente_id: task?.cliente_id || defaultClientId || clients[0]?.id || '',
    titulo: task?.titulo || '',
    descripcion: task?.descripcion || '',
    tipo_de_tarea: task?.tipo_de_tarea || '',
    prioridad: task?.prioridad || 'media' as TaskPriority,
    tiempo_estimado: task?.tiempo_estimado || 'medio' as TaskDuration,
    estado: task?.estado || 'pendiente' as TaskStatus,
    deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
    notas: task?.notas || '',
    link_externo: task?.link_externo || '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const now = new Date().toISOString()
    const isResolved = form.estado === 'entregada' || form.estado === 'aprobada'
    const fecha_de_resolucion = isResolved ? (task?.fecha_de_resolucion || now) : null
    const mes = form.deadline
      ? new Date(form.deadline).toISOString().slice(0, 7)
      : new Date().toISOString().slice(0, 7)

    const payload = {
      ...form,
      deadline: form.deadline || null,
      descripcion: form.descripcion || null,
      tipo_de_tarea: form.tipo_de_tarea || null,
      notas: form.notas || null,
      link_externo: form.link_externo || null,
      fecha_de_resolucion,
      mes,
    }

    if (task) {
      await supabase.from('tareas').update(payload).eq('id', task.id)
    } else {
      await supabase.from('tareas').insert(payload)
    }
    setLoading(false)
    onSuccess()
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
  const labelClass = "block text-xs font-medium text-slate-600 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Título *</label>
          <input required className={inputClass} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Nombre de la tarea" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Cliente *</label>
          <select required className={inputClass} value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)}>
            {clients.filter(c => c.estado === 'activo').map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prioridad</label>
          <select className={inputClass} value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
            {['baja', 'media', 'alta', 'urgente'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <select className={inputClass} value={form.estado} onChange={e => set('estado', e.target.value)}>
            {['pendiente', 'en proceso', 'en revisión', 'aprobada', 'entregada', 'pausada'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipo de tarea</label>
          <input className={inputClass} value={form.tipo_de_tarea} onChange={e => set('tipo_de_tarea', e.target.value)} placeholder="ej. copy, diseño, pauta..." />
        </div>
        <div>
          <label className={labelClass}>Tiempo estimado</label>
          <select className={inputClass} value={form.tiempo_estimado} onChange={e => set('tiempo_estimado', e.target.value)}>
            {['corto', 'medio', 'largo'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Deadline</label>
          <input type="date" className={inputClass} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea rows={2} className={inputClass} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción opcional..." />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Notas</label>
          <textarea rows={2} className={inputClass} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Notas internas..." />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Link externo</label>
          <input type="url" className={inputClass} value={form.link_externo} onChange={e => set('link_externo', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear tarea'}</Button>
      </div>
    </form>
  )
}
