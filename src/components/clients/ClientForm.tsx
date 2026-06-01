'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { Client, ClientStatus } from '@/lib/types'

const PRESET_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16']

interface ClientFormProps {
  client?: Client
  onSuccess: () => void
  onCancel: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: client?.nombre || '',
    descripcion: client?.descripcion || '',
    color: client?.color || PRESET_COLORS[0],
    estado: client?.estado || 'activo' as ClientStatus,
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, descripcion: form.descripcion || null }
    if (client) {
      await supabase.from('clientes').update(payload).eq('id', client.id)
    } else {
      await supabase.from('clientes').insert(payload)
    }
    setLoading(false)
    onSuccess()
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
        <input required className={inputClass} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del cliente" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
        <textarea rows={2} className={inputClass} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Opcional..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Color identificatorio</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
        <select className={inputClass} value={form.estado} onChange={e => set('estado', e.target.value)}>
          {['activo', 'pausado', 'cerrado'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : client ? 'Actualizar' : 'Crear cliente'}</Button>
      </div>
    </form>
  )
}
