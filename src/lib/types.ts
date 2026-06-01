export type ClientStatus = 'activo' | 'pausado' | 'cerrado'
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente'
export type TaskStatus = 'pendiente' | 'en proceso' | 'en revisión' | 'aprobada' | 'entregada' | 'pausada'
export type TaskDuration = 'corto' | 'medio' | 'largo'

export interface Client {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  estado: ClientStatus
  created_at: string
}

export interface Task {
  id: string
  cliente_id: string
  titulo: string
  descripcion: string | null
  tipo_de_tarea: string | null
  prioridad: TaskPriority
  tiempo_estimado: TaskDuration
  estado: TaskStatus
  deadline: string | null
  created_at: string
  fecha_de_resolucion: string | null
  mes: string | null
  notas: string | null
  link_externo: string | null
  clientes?: Client
}
