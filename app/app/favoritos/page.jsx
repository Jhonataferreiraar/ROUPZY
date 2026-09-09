import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const { supabase, user } = await getAuthContext()
  const feedback = requireSupabaseResult(await supabase.from('outfit_feedback').select('outfit_id, updated_at').eq('owner_id', user.id).eq('kind', 'favorited').order('updated_at', { ascending: false }), 'Não foi possível carregar seus favoritos.')
  const ids = (feedback || []).map((item) => item.outfit_id)
  const outfits = ids.length ? requireSupabaseResult(await supabase.from('outfits').select('id, occasion, vibe, explanation, score, created_at, outfit_items(clothing_item_id, clothing_items(name, category))').eq('owner_id', user.id).in('id', ids), 'Não foi possível carregar os looks favoritos.') : []
  const order = new Map(ids.map((id, index) => [id, index]))
  const ordered = (outfits || []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / FAVORITOS</span><h1>O que vale<br />{' '}<em>repetir.</em></h1><p>Combinações que você escolheu guardar para reencontrar sem recomeçar do zero.</p></div><Link className="app-primary-button" href="/app/looks/criar">Criar outro look <span>↗</span></Link></div>
      <section className="favorite-list"><div className="app-section-label"><span>01</span><span>Seu arquivo de favoritos</span><span className="app-count">{ordered.length} salvos</span></div>{ordered.length ? ordered.map((outfit, index) => <article className="favorite-row" key={outfit.id}><span>0{index + 1}</span><div><small>{outfit.occasion}</small><Link className="saved-look-title-link" href={'/app/looks/' + outfit.id}><h2>{outfit.vibe || 'Combinação guardada'}</h2></Link><p>{outfit.explanation}</p><div>{outfit.outfit_items?.map((item) => <b key={item.clothing_item_id}>{item.clothing_items?.name || 'Peça registrada'}</b>)}</div><Link className="app-panel-link saved-look-open-link" href={'/app/looks/' + outfit.id}>Abrir e gerenciar ↗</Link></div></article>) : <div className="app-empty"><span className="app-empty-mark">♡</span><strong>Ainda não há favoritos.</strong><p>Quando um look fizer sentido, guarde-o aqui.</p></div>}</section>
    </div>
  )
}
