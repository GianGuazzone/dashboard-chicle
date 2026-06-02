'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientForm } from '@/components/clients/ClientForm'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/lib/types'
import Link from 'next/link'

const statusBadge: Record<string, string> = {
  activo: 'bg-emerald-100 text-emerald-700',
  pausado: 'bg-yellow-100 text-yellow-700',
  cerrado: 'bg-slate-100 text-slate-500',
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('clientes').select('*').order('nombre')
    setClients((data || []) as Client[])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} clientes registrados</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} />
          Agregar cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: client.color }}>
                  {client.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{client.nombre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[client.estado]}`}>{client.estado}</span>
                </div>
              </div>
              <button onClick={() => setEditing(client)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
            {client.descripcion && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{client.descripcion}</p>}
            <Link href={`/clientes/${client.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              <Users size={13} />
              Ver tareas
            </Link>
          </div>
        ))}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nuevo cliente" size="sm">
        <ClientForm onSuccess={() => { setOpen(false); load() }} onCancel={() => setOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar cliente" size="sm">
        {editing && <ClientForm client={editing} onSuccess={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
