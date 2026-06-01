'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart3, Calendar, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/lib/types'

interface SidebarProps {
  clients: Client[]
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
]

export function Sidebar({ clients }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <div>
            <p className="font-bold text-sm leading-tight">Chicle</p>
            <p className="text-xs text-slate-400 leading-tight">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-0.5">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}>
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="mt-6 px-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Clientes</p>
          <div className="space-y-0.5">
            {clients.filter(c => c.estado === 'activo').map(client => {
              const active = pathname === `/clientes/${client.id}`
              return (
                <Link key={client.id} href={`/clientes/${client.id}`} className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group',
                  active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: client.color }} />
                  <span className="truncate">{client.nombre}</span>
                  <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">Marketing Digital</p>
      </div>
    </aside>
  )
}
