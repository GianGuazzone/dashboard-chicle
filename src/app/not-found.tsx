import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <h2 className="text-xl font-semibold text-slate-700">Página no encontrada</h2>
      <Link href="/" className="text-sm text-violet-600 hover:underline">Volver al dashboard</Link>
    </div>
  )
}
