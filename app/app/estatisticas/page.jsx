import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const categoryLabels = {
  top: 'Partes de cima',
  bottom: 'Partes de baixo',
  one_piece: 'Peças únicas',
  outerwear: 'Terceiras peças',
  shoe: 'Sapatos',
  bag: 'Bolsas',
  accessory: 'Acessórios',
  unknown: 'A confirmar'
}

export default async function StatisticsPage() {
  const { supabase, user } = await getAuthContext()
  const results = await Promise.all([
    supabase.from('clothing_items').select('category, availability, created_at').eq('owner_id', user.id).is('deleted_at', null),
    supabase.from('outfits').select('id, occasion, vibe, created_at').eq('owner_id', user.id),
    supabase.from('outfit_feedback').select('outfit_id, kind').eq('owner_id', user.id),
    supabase.from('outfit_history').select('id, used_on').eq('owner_id', user.id)
  ])
  if (results.some((result) => result.error)) throw new Error('Não foi possível preparar as estatísticas do seu espaço.')
  const [{ data: pieces }, { data: outfits }, { data: feedback }, { data: history }] = results

  const activePieces = (pieces || []).filter((piece) => piece.availability === 'active' || !piece.availability)
  const categoryCounts = activePieces.reduce((counts, piece) => {
    counts[piece.category] = (counts[piece.category] || 0) + 1
    return counts
  }, {})
  const categories = Object.entries(categoryCounts).sort(([, countA], [, countB]) => countB - countA)
  const favorites = (feedback || []).filter((entry) => entry.kind === 'favorited').length
  const used = history?.length || 0
  const mostRequested = Object.entries((outfits || []).reduce((counts, outfit) => {
    counts[outfit.occasion] = (counts[outfit.occasion] || 0) + 1
    return counts
  }, {})).sort(([, countA], [, countB]) => countB - countA)[0]
  const latestUse = [...(history || [])].sort((a, b) => String(b.used_on).localeCompare(String(a.used_on)))[0]
  const maxCategoryCount = categories[0]?.[1] || 1

  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / LEITURA</span><h1>Seu estilo<br />{' '}<em>em números.</em></h1><p>Uma leitura simples do que você registra, usa e repete. Os dados ajudam a enxergar o seu próprio repertório.</p></div><Link className="app-outline-button" href="/app/closet">Abrir meu closet <span>↗</span></Link></div>

      <section className="stats-overview" aria-label="Resumo do seu uso">
        <div><span>Peças ativas</span><strong>{activePieces.length}</strong><small>no seu closet</small></div>
        <div><span>Looks criados</span><strong>{outfits?.length || 0}</strong><small>combinações salvas</small></div>
        <div><span>Favoritos</span><strong>{favorites}</strong><small>para repetir</small></div>
        <div><span>Usados</span><strong>{used}</strong><small>memórias registradas</small></div>
      </section>

      <div className="stats-dashboard-grid">
        <section className="stats-panel">
          <div className="app-section-label"><span>Seu arquivo</span><span>{activePieces.length ? 'por categoria' : 'ainda vazio'}</span></div>
          {categories.length ? <div className="stats-category-list">{categories.map(([category, count]) => <div className="stats-category-row" key={category}><div><strong>{categoryLabels[category] || category}</strong><span>{count} {count === 1 ? 'peça' : 'peças'}</span></div><div className="stats-bar"><span style={{ width: `${Math.round((count / maxCategoryCount) * 100)}%` }} /></div></div>)}</div> : <div className="app-empty app-empty-small"><span className="app-empty-mark">R</span><strong>Seu arquivo começa aqui.</strong><p>Registre algumas peças para entender como o seu closet se organiza.</p></div>}
        </section>

        <section className="stats-panel stats-panel-dark">
          <div className="app-section-label"><span>O que aparece</span><span>seu ritmo</span></div>
          {mostRequested ? <div className="stats-highlight"><small>Ocasião mais explorada</small><strong>{mostRequested[0]}</strong><p>{mostRequested[1]} {mostRequested[1] === 1 ? 'look criado' : 'looks criados'} para esse momento.</p></div> : <div className="stats-highlight"><small>Quando você começar</small><strong>As escolhas<br />{' '}ganham forma.</strong><p>Crie um look para que o seu histórico comece a contar essa história.</p></div>}
          {latestUse ? <div className="stats-last-use"><span>Último uso registrado</span><strong>{new Date(`${latestUse.used_on}T12:00:00`).toLocaleDateString('pt-BR')}</strong></div> : null}
        </section>
      </div>
    </div>
  )
}
