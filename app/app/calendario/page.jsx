import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Calendário de looks', robots: { index: false, follow: false } }

function monthCells(entries) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const byDay = new Map(entries.filter((entry) => {
    const date = new Date(`${entry.used_on}T12:00:00`)
    return date.getFullYear() === year && date.getMonth() === month
  }).map((entry) => [new Date(`${entry.used_on}T12:00:00`).getDate(), entry]))
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: days }, (_, index) => ({ day: index + 1, entry: byDay.get(index + 1) }))
  ]
}

export default async function CalendarPage() {
  const { supabase, user } = await getAuthContext()
  const { data, error } = await supabase.from('outfit_history').select('id, used_on, notes, outfits(id, vibe, occasion)').eq('owner_id', user.id).order('used_on', { ascending: false }).limit(90)
  if (error) throw new Error('Não foi possível carregar o calendário.')
  const entries = data || []
  const cells = monthCells(entries)
  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return <div className="app-page shell rv-module-page">
    <header className="rv-module-hero"><div><span className="app-kicker">PLANEJAMENTO PESSOAL</span><h1>Seu estilo<br />{' '}<em>no calendário.</em></h1><p>Veja o que você vestiu e transforme o histórico em uma referência para os próximos dias.</p></div><Link className="app-primary-button" href="/app/looks/criar">Planejar um look <span>↗</span></Link></header>
    <section className="rv-calendar-panel" aria-labelledby="calendar-title">
      <div className="rv-module-panel-head"><div><span>ESTE MÊS</span><h2 id="calendar-title">{month}</h2></div><strong>{entries.length} usos registrados</strong></div>
      <div className="rv-calendar-week" aria-hidden="true">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="rv-calendar-grid">{cells.map((cell, index) => cell ? <article className={cell.entry ? 'has-look' : ''} key={cell.day}><span>{cell.day}</span>{cell.entry ? <><strong>{cell.entry.outfits?.vibe || 'Look usado'}</strong><small>{cell.entry.outfits?.occasion || 'Registro pessoal'}</small></> : <small>Sem registro</small>}</article> : <span className="rv-calendar-empty" key={`empty-${index}`} />)}</div>
    </section>
  </div>
}
