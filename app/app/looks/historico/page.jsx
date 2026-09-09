import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function LookHistoryPage() {
  const { supabase, user } = await getAuthContext()
  const history = requireSupabaseResult(await supabase.from('outfit_history').select('id, used_on, created_at, outfits(id, occasion, vibe, explanation)').eq('owner_id', user.id).order('used_on', { ascending: false }).limit(60), 'Não foi possível carregar seu histórico.')
  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / HISTÓRICO</span><h1>Vestido,<br />{' '}<em>lembrado.</em></h1><p>Seu histórico mostra as escolhas que saíram do armário e ganharam o dia.</p></div><Link className="app-outline-button" href="/app/looks/criar">Criar um look <span>↗</span></Link></div>
      <section className="history-list"><div className="app-section-label"><span>01</span><span>Peças de memória</span><span className="app-count">{history?.length || 0} registros</span></div>{history?.length ? history.map((entry, index) => <article key={entry.id}><span>0{(index % 9) + 1}</span><div><small>{new Date(entry.used_on).toLocaleDateString('pt-BR')}</small><Link className="saved-look-title-link" href={entry.outfits?.id ? '/app/looks/' + entry.outfits.id : '/app/looks'}><strong>{entry.outfits?.occasion || 'Look usado'}</strong></Link><p>{entry.outfits?.vibe || 'Combinação registrada'} · {entry.outfits?.explanation || 'Você marcou esta combinação como usada.'}</p>{entry.outfits?.id ? <Link className="app-panel-link saved-look-open-link" href={'/app/looks/' + entry.outfits.id}>Abrir look ↗</Link> : null}</div></article>) : <div className="app-empty"><span className="app-empty-mark">↗</span><strong>Seu histórico começa no próximo uso.</strong><p>Marque um look como usado para criar uma memória do seu closet.</p></div>}</section>
    </div>
  )
}
