'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Client } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 shrink-0 text-right truncate">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}>
          {pct > 15 && <span className="text-xs text-white font-semibold">{value}</span>}
        </div>
      </div>
      {pct <= 15 && <span className="text-xs text-slate-600 font-medium w-4">{value}</span>}
    </div>
  )
}

const priorityColors: Record<string, string> = { baja: '#94a3b8', media: '#3b82f6', alta: '#f97316', urgente: '#ef4444' }

export default function StatsPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from('tareas').select('*, clientes(*)'),
        supabase.from('clientes').select('*'),
      ])
      setTasks((t || []) as Task[])
      setClients((c || []) as Client[])
    }
    load()
  }, [])

  const byMonth = tasks.reduce<Record<string, { created: number; resolved: number }>>((acc, t) => {
    const m = t.mes || t.created_at.slice(0, 7)
    if (!acc[m]) acc[m] = { created: 0, resolved: 0 }
    acc[m].created++
    if (t.estado === 'entregada' || t.estado === 'aprobada') acc[m].resolved++
    return acc
  }, {})

  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxByMonth = Math.max(...months.map(([, v]) => v.created), 1)

  const byClient = clients.map(c => ({
    name: c.nombre,
    color: c.color,
    total: tasks.filter(t => t.cliente_id === c.id).length,
    resolved: tasks.filter(t => t.cliente_id === c.id && (t.estado === 'entregada' || t.estado === 'aprobada')).length,
  })).sort((a, b) => b.total - a.total)
  const maxByClient = Math.max(...byClient.map(c => c.total), 1)

  const byPriority = ['urgente', 'alta', 'media', 'baja'].map(p => ({
    name: p, value: tasks.filter(t => t.prioridad === p).length
  }))
  const maxByPriority = Math.max(...byPriority.map(p => p.value), 1)

  const byStatus = ['pendiente', 'en proceso', 'en revisión', 'aprobada', 'entregada', 'pausada'].map(s => ({
    name: s, value: tasks.filter(t => t.estado === s).length
  })).filter(s => s.value > 0)
  const maxByStatus = Math.max(...byStatus.map(s => s.value), 1)

  const durationMap: Record<string, number> = { corto: 1, medio: 3, largo: 8 }
  const totalHours = tasks.reduce((acc, t) => acc + (durationMap[t.tiempo_estimado] || 0), 0)

  const renderCard = (title: string, children: React.ReactNode) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 mb-5">{title}</h2>
      {children}
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de productividad</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total tareas', value: tasks.length, color: 'text-violet-600' },
          { label: 'Resueltas', value: tasks.filter(t => t.estado === 'entregada' || t.estado === 'aprobada').length, color: 'text-emerald-600' },
          { label: 'Pendientes', value: tasks.filter(t => t.estado === 'pendiente').length, color: 'text-slate-600' },
          { label: 'Horas estimadas', value: totalHours, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCard('Tareas por mes',
          <div className="space-y-3">
            {months.map(([month, data]) => (
              <div key={month}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{format(parseISO(month + '-01'), 'MMMM yyyy', { locale: es })}</span>
                  <span>{data.resolved}/{data.created} resueltas</span>
                </div>
                <div className="flex gap-1 h-4">
                  <div className="bg-violet-500 rounded-full h-full transition-all" style={{ width: `${(data.created / maxByMonth) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {renderCard('Tareas por cliente',
          <div className="space-y-3">
            {byClient.map(c => (
              <Bar key={c.name} label={c.name} value={c.total} max={maxByClient} color={c.color} />
            ))}
          </div>
        )}

        {renderCard('Por prioridad',
          <div className="space-y-3">
            {byPriority.map(p => (
              <Bar key={p.name} label={p.name} value={p.value} max={maxByPriority} color={priorityColors[p.name]} />
            ))}
          </div>
        )}

        {renderCard('Por estado',
          <div className="space-y-3">
            {byStatus.map(s => (
              <Bar key={s.name} label={s.name} value={s.value} max={maxByStatus} color="#8b5cf6" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
