import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sustentabilidade', robots: { index: false, follow: false } }

export default async function SustainabilityPage() {
  const { supabase, user } = await getAuthContext()
  const [piecesResult, usesResult, favoritesResult] = await Promise.all([
    supabase.from('clothing_items').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).is('deleted_at', null),
    supabase.from('outfit_history').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('outfit_feedback').select('outfit_id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('kind', 'favorited')
  ])
  if ([piecesResult, usesResult, favoritesResult].some((result) => result.error)) throw new Error('Não foi possível carregar esta leitura.')
  const pieces = piecesResult.count || 0
  const uses = usesResult.count || 0
  const favorites = favoritesResult.count || 0

  return <div className="app-page shell rv-module-page">
    <header className="rv-module-hero rv-module-hero-green"><div><span className="app-kicker">CONSUMO MAIS CONSCIENTE</span><h1>Usar melhor<br />{' '}<em>vem antes de comprar.</em></h1><p>Esta página usa somente registros reais do seu closet. Estimativas ambientais aparecerão quando houver uma metodologia verificável.</p></div><Link className="app-outline-button" href="/app/compras">Revisar uma compra <span>↗</span></Link></header>
    <section className="rv-impact-grid" aria-label="Indicadores reais do closet"><article><span>ACERVO ATIVO</span><strong>{pieces}</strong><p>peças disponíveis para novas combinações</p></article><article><span>REUSOS REGISTRADOS</span><strong>{uses}</strong><p>looks marcados como usados por você</p></article><article><span>COMBINAÇÕES FAVORITAS</span><strong>{favorites}</strong><p>referências prontas para repetir</p></article></section>
    <section className="rv-module-note"><div><span>TRANSPARÊNCIA</span><h2>Sem porcentagens inventadas.</h2></div><p>O Roupzy não afirma redução de carbono ou compras evitadas sem dados suficientes. Por enquanto, a medida mais útil é simples: quantas vezes você voltou a usar o que já possui.</p></section>
  </div>
}
