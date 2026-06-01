'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { TaskForm } from '@/components/tasks/TaskForm'
import { cn, priorityDot } from '@/lib/utils'
import type { Task, Client } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarPage() {
  const supabase = createClient()
  const [current, setCurrent] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<Task | null>(null)
  const [editing, setEditing] = useState(false)

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

  const reload = async () => {
    const { data } = await supabase.from('tareas').select('*, clientes(*)')
    setTasks((data || []) as Task[])
  }

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => t.deadline && isSameDay(parseISO(t.deadline), day))

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendario</h1>
          <p className="text-sm text-slate-500 mt-0.5">Deadlines y entregas</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-1 py-1">
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-slate-700 px-2 capitalize">
            {format(current, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day)
            const inMonth = isSameMonth(day, current)
            const today = isToday(day)
            return (
              <div key={i} className={cn(
                'min-h-[100px] p-2 border-b border-r border-slate-100 last:border-r-0',
                !inMonth && 'bg-slate-50',
                i % 7 === 6 && 'border-r-0',
              )}>
                <div className={cn(
                  'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                  today ? 'bg-violet-600 text-white' : inMonth ? 'text-slate-600' : 'text-slate-300'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      onClick={() => setSelected(task)}
                      className="w-full text-left text-xs px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors truncate flex items-center gap-1"
                    >
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityDot[task.prioridad])} />
                      <span className="truncate">{task.titulo}</span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-slate-400 pl-1">+{dayTasks.length - 3} más</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal isOpen={!!selected && !editing} onClose={() => setSelected(null)} title={selected?.titulo || ''} size="md">
        {selected && (
          <TaskDetail
            task={selected}
            onEdit={() => setEditing(true)}
            onDelete={() => { setSelected(null); reload() }}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
      <Modal isOpen={!!selected && editing} onClose={() => setEditing(false)} title="Editar tarea" size="lg">
        {selected && (
          <TaskForm
            clients={clients}
            task={selected}
            onSuccess={() => { setEditing(false); setSelected(null); reload() }}
            onCancel={() => setEditing(false)}
          />
        )}
      </Modal>
    </div>
  )
}
