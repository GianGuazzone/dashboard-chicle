'use client'
import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { cn, statusColors } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/lib/types'

const STATUSES: TaskStatus[] = ['pendiente', 'en proceso', 'en revisión', 'aprobada', 'entregada', 'pausada']

interface StatusDropdownProps {
  task: Task
  onUpdate: (updated: Task) => void
}

export function StatusDropdown({ task, onUpdate }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = async (status: TaskStatus) => {
    if (status === task.estado) { setOpen(false); return }
    setLoading(true)
    const isResolved = status === 'entregada' || status === 'aprobada'
    const fecha_de_resolucion = isResolved
      ? (task.fecha_de_resolucion || new Date().toISOString())
      : null
    const { data } = await supabase
      .from('tareas')
      .update({ estado: status, fecha_de_resolucion })
      .eq('id', task.id)
      .select('*, clientes(*)')
      .single()
    setLoading(false)
    setOpen(false)
    if (data) onUpdate(data as Task)
  }

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all hover:opacity-80 active:scale-95',
          statusColors[task.estado],
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {task.estado}
        <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[160px]">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={cn(
                'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center gap-2',
                s === task.estado && 'font-semibold'
              )}
            >
              <span className={cn('inline-flex px-2 py-0.5 rounded-full border font-medium', statusColors[s])}>
                {s}
              </span>
              {s === task.estado && <CheckCircle2 size={12} className="text-violet-500 ml-auto" />}
            </button>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => handleSelect('entregada')}
              className="w-full text-left px-3 py-2 text-xs text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 size={12} />
              Marcar como entregada
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
