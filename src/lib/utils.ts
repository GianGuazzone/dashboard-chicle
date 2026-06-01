import { clsx, type ClassValue } from 'clsx'
import { format, isBefore, addDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Task, TaskPriority, TaskStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return format(parseISO(date), 'dd MMM yyyy', { locale: es })
}

export function getTaskUrgency(task: Task): 'overdue' | 'urgent' | 'normal' | 'resolved' {
  if (task.estado === 'entregada' || task.estado === 'aprobada') return 'resolved'
  if (!task.deadline) return 'normal'
  const now = new Date()
  const deadline = parseISO(task.deadline)
  if (isBefore(deadline, now)) return 'overdue'
  if (isBefore(deadline, addDays(now, 3))) return 'urgent'
  return 'normal'
}

export const priorityColors: Record<TaskPriority, string> = {
  baja: 'bg-slate-100 text-slate-600 border-slate-200',
  media: 'bg-blue-50 text-blue-700 border-blue-200',
  alta: 'bg-orange-50 text-orange-700 border-orange-200',
  urgente: 'bg-red-50 text-red-700 border-red-200',
}

export const priorityDot: Record<TaskPriority, string> = {
  baja: 'bg-slate-400',
  media: 'bg-blue-500',
  alta: 'bg-orange-500',
  urgente: 'bg-red-500',
}

export const statusColors: Record<TaskStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-700 border-slate-200',
  'en proceso': 'bg-blue-100 text-blue-700 border-blue-200',
  'en revisión': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  aprobada: 'bg-green-100 text-green-700 border-green-200',
  entregada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pausada: 'bg-gray-100 text-gray-500 border-gray-200',
}

export const priorityOrder: Record<TaskPriority, number> = {
  urgente: 0, alta: 1, media: 2, baja: 3
}
