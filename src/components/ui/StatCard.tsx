import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: 'violet' | 'blue' | 'green' | 'red' | 'orange' | 'slate'
  subtitle?: string
  onClick?: () => void
  active?: boolean
}

const colorMap = {
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700', ring: 'ring-violet-400' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700', ring: 'ring-blue-400' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', ring: 'ring-emerald-400' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-700', ring: 'ring-red-400' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-700', ring: 'ring-orange-400' },
  slate: { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-600', text: 'text-slate-700', ring: 'ring-slate-400' },
}

export function StatCard({ title, value, icon: Icon, color, subtitle, onClick, active }: StatCardProps) {
  const c = colorMap[color]
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 border border-white/60 shadow-sm text-left w-full transition-all',
        c.bg,
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-100',
        active && `ring-2 ${c.ring} shadow-md`,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', c.text)}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {onClick && <p className="text-xs text-slate-400 mt-1 opacity-0 group-hover:opacity-100">Click para filtrar</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl', c.icon)}>
          <Icon size={20} />
        </div>
      </div>
    </Tag>
  )
}
