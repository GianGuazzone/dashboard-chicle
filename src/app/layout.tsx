import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Client } from '@/lib/types'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chicle Dashboard',
  description: 'Gestión de tareas de marketing digital',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre')

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar clients={(clients || []) as Client[]} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
