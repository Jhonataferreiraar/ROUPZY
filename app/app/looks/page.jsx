import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function LooksPage() {
  const { supabase, user } = await getAuthContext()
  const outfits = requireSupabaseResult(await supabase.from('outfits').select('id, occasion, vibe, explanation, score, created_at, outfit_items(clothing_item_id, role, clothing_items(name, category))').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(30), 'Não foi possível carregar seus looks.')
  return (
    <div className="app-page shell">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / LOOKS</span><h1>Vista o que<br />{' '}<em>faz sentido.</em></h1><p>Escolha um momento e receba caminhos criados exclusivamente com as peças do seu arquivo.</p></div><Link className="app-primary-button" href="/app/looks/criar">Criar looks <span>↗</span></Link></div>
      <section className="looks-history-panel"><div className="app-section-label"><span>01</span><span>Histórico de combinações</span><span className="app-count">{outfits?.length || 0} registradas</span><Link className="app-panel-link" href="/app/looks/historico">Ver usos registrados ↗</Link></div>{outfits?.length ? <div className="saved-look-grid">{outfits.map((outfit, index) => <article className="saved-look-card" key={outfit.id}><div className="saved-look-number">0{(index % 9) + 1}</div><div><span>{outfit.occasion}</span><Link className="saved-look-title-link" href={'/app/looks/' + outfit.id}><h2>{outfit.vibe || 'Combinação do dia'}</h2></Link><p>{outfit.explanation}</p><div className="saved-look-pieces">{outfit.outfit_items?.map((relation) => <b key={relation.clothing_item_id}>{relation.clothing_items?.name || 'Peça registrada'}</b>)}</div><Link className="app-panel-link saved-look-open-link" href={'/app/looks/' + outfit.id}>Abrir look ↗</Link></div></article>)}</div> : <div className="app-empty"><span className="app-empty-mark">↗</span><strong>Ainda não há looks salvos.</strong><p>Quando você gerar uma combinação, ela fica registrada aqui para voltar quando quiser.</p></div>}</section>
    </div>
  )
}
