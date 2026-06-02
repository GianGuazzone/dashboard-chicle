'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart3, Calendar, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/lib/types'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
]

export function Sidebar({ clients }: { clients: Client[] }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0" style={{ background: 'linear-gradient(180deg, #1e1b2e 0%, #16132a 100%)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
            Ch
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight tracking-tight">Chicle</p>
            <p className="text-[11px] leading-tight" style={{ color: '#a78bfa' }}>Gestión de tareas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main nav */}
        <div className="space-y-0.5 mb-6">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                style={active ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(168,85,247,0.6))' } : {}}
              >
                <item.icon size={16} className={active ? 'text-violet-200' : ''} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Clients */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: '#6b5b9e' }}>
            Clientes
          </p>
          <div className="space-y-0.5">
            {clients.filter(c => c.estado === 'activo').map(client => {
              const active = pathname === `/clientes/${client.id}`
              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group',
                    active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white/20" style={{ backgroundColor: client.color }} />
                  <span className="truncate">{client.nombre}</span>
                  <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: '#a78bfa' }} />
          <p className="text-[11px]" style={{ color: '#6b5b9e' }}>Marketing Digital</p>
        </div>
      </div>
    </aside>
  )
}
