'use client'
import { Search, X } from 'lucide-react'
import type { Client } from '@/lib/types'

export interface Filters {
  search: string
  clientId: string
  estado: string
  prioridad: string
  mes: string
}

interface TaskFiltersProps {
  filters: Filters
  onChange: (f: Filters) => void
  clients: Client[]
}

export function TaskFilters({ filters, onChange, clients }: TaskFiltersProps) {
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v })
  const hasFilters = filters.search || filters.clientId || filters.estado || filters.prioridad || filters.mes

  const selectClass = "px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 w-48 bg-white"
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
        />
      </div>
      <select className={selectClass} value={filters.clientId} onChange={e => set('clientId', e.target.value)}>
        <option value="">Todos los clientes</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>
      <select className={selectClass} value={filters.estado} onChange={e => set('estado', e.target.value)}>
        <option value="">Todos los estados</option>
        {['pendiente', 'en proceso', 'en revisión', 'aprobada', 'entregada', 'pausada'].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <select className={selectClass} value={filters.prioridad} onChange={e => set('prioridad', e.target.value)}>
        <option value="">Todas las prioridades</option>
        {['baja', 'media', 'alta', 'urgente'].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      {hasFilters && (
        <button onClick={() => onChange({ search: '', clientId: '', estado: '', prioridad: '', mes: '' })} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors px-2 py-2">
          <X size={13} />
          Limpiar
        </button>
      )}
    </div>
  )
}
