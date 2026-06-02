'use client'
import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Header } from '@/components/layout/Header'
import { TaskGrid } from '@/components/tasks/TaskGrid'
import { TaskFilters, type Filters } from '@/components/tasks/TaskFilters'
import { createClient } from '@/lib/supabase/client'
import { getTaskUrgency } from '@/lib/utils'
import type { Task, Client } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type ExtendedFilters = Filters & { _overdue?: boolean }

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [client, setClientData] = useState<Client | null>(null)
  const [filters, setFilters] = useState<ExtendedFilters>({ search: '', clientId: '', estado: '', prioridad: '', mes: '' })
  const [activeCard, setActiveCard] = useState<string | null>(null)
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData() }, [loadData])

  const now = new Date().toISOString().slice(0, 7)
  const monthLabel = format(new Date(), 'MMMM yyyy', { locale: es })

  const stats = {
    pending: tasks.filter(t => t.estado === 'pendiente').length,
    inProgress: tasks.filter(t => t.estado === 'en proceso').length,
    resolvedThisMonth: tasks.filter(t => (t.estado === 'entregada' || t.estado === 'aprobada') && t.mes === now).length,
    overdue: tasks.filter(t => getTaskUrgency(t) === 'overdue').length,
  }

  const tasksThisMonth = tasks.filter(t => (t.mes || t.created_at.slice(0, 7)) === now)
  const resolvedThisMonthCount = tasksThisMonth.filter(t => t.estado === 'entregada' || t.estado === 'aprobada').length

  const handleCardClick = (cardKey: string, newFilters: ExtendedFilters) => {
    if (activeCard === cardKey) {
      setActiveCard(null)
      setFilters({ search: '', clientId: '', estado: '', prioridad: '', mes: '' })
    } else {
      setActiveCard(cardKey)
      setFilters(newFilters)
    }
  }

  const filtered = tasks.filter(t => {
    if (filters.search && !t.titulo.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.estado && t.estado !== filters.estado) return false
    if (filters.prioridad && t.prioridad !== filters.prioridad) return false
    if (filters.mes && t.mes !== filters.mes) return false
    if (filters._overdue && getTaskUrgency(t) !== 'overdue') return false
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        {client && <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: client.color }} />}
        <Header
          title={client?.nombre || 'Cliente'}
          subtitle={`${tasks.length} tareas en total`}
          clients={clients}
          defaultClientId={id}
          onTaskCreated={loadData}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={ClipboardList}
          color="slate"
          active={activeCard === 'pending'}
          onClick={() => handleCardClick('pending', { search: '', clientId: '', estado: 'pendiente', prioridad: '', mes: '' })}
        />
        <StatCard
          title="En proceso"
          value={stats.inProgress}
          icon={Clock}
          color="blue"
          active={activeCard === 'inProgress'}
          onClick={() => handleCardClick('inProgress', { search: '', clientId: '', estado: 'en proceso', prioridad: '', mes: '' })}
        />
        <StatCard
          title="Resueltas este mes"
          value={stats.resolvedThisMonth}
          icon={CheckCircle2}
          color="green"
          active={activeCard === 'resolved'}
          onClick={() => handleCardClick('resolved', { search: '', clientId: '', estado: '', prioridad: '', mes: now })}
        />
        <StatCard
          title="Vencidas"
          value={stats.overdue}
          icon={AlertCircle}
          color="red"
          active={activeCard === 'overdue'}
          onClick={() => handleCardClick('overdue', { search: '', clientId: '', estado: '', prioridad: '', mes: '', _overdue: true })}
        />
      </div>

      <ProgressBar total={tasksThisMonth.length} resolved={resolvedThisMonthCount} month={monthLabel} />

      <div className="mb-6">
        <TaskFilters
          filters={filters}
          onChange={(f) => { setFilters(f); setActiveCard(null) }}
          clients={[]}
        />
      </div>

      <TaskGrid tasks={filtered} clients={clients} onRefresh={loadData} />
    </div>
  )
}
