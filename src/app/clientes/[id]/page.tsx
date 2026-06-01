'use client'
import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Header } from '@/components/layout/Header'
import { TaskGrid } from '@/components/tasks/TaskGrid'
import { TaskFilters, type Filters } from '@/components/tasks/TaskFilters'
import { createClient } from '@/lib/supabase/client'
import { getTaskUrgency } from '@/lib/utils'
import type { Task, Client } from '@/lib/types'

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [client, setClientData] = useState<Client | null>(null)
  const [filters, setFilters] = useState<Filters>({ search: '', clientId: '', estado: '', prioridad: '', mes: '' })
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [{ data: t }, { data: c }, { data: cl }] = await Promise.all([
      supabase.from('tareas').select('*, clientes(*)').eq('cliente_id', id).order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('clientes').select('*').eq('id', id).single(),
    ])
    setTasks((t || []) as Task[])
    setClients((c || []) as Client[])
    setClientData(cl as Client)
    setLoading(false)
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const filtered = tasks.filter(t => {
    if (filters.search && !t.titulo.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.estado && t.estado !== filters.estado) return false
    if (filters.prioridad && t.prioridad !== filters.prioridad) return false
    return true
  })

  const now = new Date().toISOString().slice(0, 7)
  const stats = {
    pending: tasks.filter(t => t.estado === 'pendiente').length,
    inProgress: tasks.filter(t => t.estado === 'en proceso').length,
    resolvedThisMonth: tasks.filter(t => (t.estado === 'entregada' || t.estado === 'aprobada') && t.mes === now).length,
    overdue: tasks.filter(t => getTaskUrgency(t) === 'overdue').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <Header
        title={client?.nombre || 'Cliente'}
        subtitle={`${tasks.length} tareas en total`}
        clients={clients}
        defaultClientId={id}
        onTaskCreated={loadData}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Pendientes" value={stats.pending} icon={ClipboardList} color="slate" />
        <StatCard title="En proceso" value={stats.inProgress} icon={Clock} color="blue" />
        <StatCard title="Resueltas este mes" value={stats.resolvedThisMonth} icon={CheckCircle2} color="green" />
        <StatCard title="Vencidas" value={stats.overdue} icon={AlertCircle} color="red" />
      </div>
      <div className="mb-6">
        <TaskFilters filters={filters} onChange={setFilters} clients={[]} />
      </div>
      <TaskGrid tasks={filtered} clients={clients} onRefresh={loadData} />
    </div>
  )
}
