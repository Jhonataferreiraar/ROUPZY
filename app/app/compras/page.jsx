import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { clothingCategoryLabel } from '@/lib/ui/labels'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Compras inteligentes', robots: { index: false, follow: false } }

const coreCategories = ['top', 'bottom', 'one_piece', 'outerwear', 'shoe']

export default async function SmartShoppingPage() {
  const { supabase, user } = await getAuthContext()
  const { data, error } = await supabase.from('clothing_items').select('category').eq('owner_id', user.id).is('deleted_at', null)
  if (error) throw new Error('Não foi possível analisar as lacunas do closet.')
  const counts = (data || []).reduce((map, item) => ({ ...map, [item.category]: (map[item.category] || 0) + 1 }), {})
  const gaps = coreCategories.filter((category) => !counts[category])

  return <div className="app-page shell rv-module-page">
    <header className="rv-module-hero"><div><span className="app-kicker">COMPRAR COM CONTEXTO</span><h1>Antes de comprar,<br />{' '}<em>olhe o que já existe.</em></h1><p>O Roupzy identifica lacunas no seu acervo sem transformar cada ausência em uma recomendação de compra.</p></div><Link className="app-outline-button" href="/app/estatisticas">Ver meu uso <span>↗</span></Link></header>
    <div className="rv-module-split">
      <section className="rv-module-panel"><div className="rv-module-panel-head"><div><span>LEITURA DO ACERVO</span><h2>Lacunas observadas</h2></div><strong>{gaps.length ? `${gaps.length} categorias` : 'Base equilibrada'}</strong></div>{gaps.length ? <div className="rv-insight-list">{gaps.map((category) => <article key={category}><span>ANALISAR</span><h3>{clothingCategoryLabel(category)}</h3><p>Não há peças ativas desta categoria no seu closet. Confirme se isso limita as combinações antes de comprar.</p></article>)}</div> : <div className="app-empty"><span className="app-empty-mark">✓</span><strong>Nenhuma lacuna estrutural apareceu.</strong><p>Continue observando o uso antes de adicionar uma nova peça.</p></div>}</section>
      <aside className="rv-module-aside rv-module-aside-coral"><span>FILTRO DE DECISÃO</span><h2>Uma compra precisa responder a três perguntas.</h2><ol><li>Combina com pelo menos três peças que você já tem?</li><li>Resolve uma ocasião recorrente?</li><li>Substitui uma necessidade real em vez de repetir uma peça esquecida?</li></ol></aside>
    </div>
  </div>
}
