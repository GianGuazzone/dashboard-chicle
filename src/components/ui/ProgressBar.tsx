interface ProgressBarProps {
  total: number
  resolved: number
  month?: string
}

export function ProgressBar({ total, resolved, month }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Progreso mensual</span>
          {month && <span className="text-xs text-slate-400 capitalize">{month}</span>}
        </div>
        <span className="text-sm font-bold text-violet-600">{pct}% completado</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-400">{resolved} de {total} tareas del mes</span>
        {pct === 100 && <span className="text-xs font-semibold text-emerald-600">¡Mes completado! 🎉</span>}
      </div>
    </div>
  )
}
