import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { clothingCategoryLabel } from '@/lib/ui/labels'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cápsulas de guarda-roupa', robots: { index: false, follow: false } }

export default async function CapsulesPage() {
  const { supabase, user } = await getAuthContext()
  const { data, error } = await supabase.from('clothing_items').select('id, name, category, colors, formality').eq('owner_id', user.id).is('deleted_at', null).eq('availability', 'active').order('created_at', { ascending: false }).limit(24)
  if (error) throw new Error('Não foi possível preparar sua cápsula.')
  const pieces = data || []
  const capsule = pieces.slice(0, 12)

  return <div className="app-page shell rv-module-page">
    <header className="rv-module-hero"><div><span className="app-kicker">MENOS PEÇAS, MAIS CAMINHOS</span><h1>Cápsulas<br />{' '}<em>com o que é seu.</em></h1><p>Separe uma seleção pequena e versátil para uma semana, uma estação ou uma viagem.</p></div><Link className="app-outline-button" href="/app/closet">Revisar meu closet <span>↗</span></Link></header>
    <div className="rv-module-split">
      <section className="rv-module-panel"><div className="rv-module-panel-head"><div><span>SELEÇÃO ATUAL</span><h2>Cápsula-base</h2></div><strong>{capsule.length}/12 peças</strong></div>{capsule.length ? <div className="rv-capsule-list">{capsule.map((piece, index) => <Link href={`/app/closet/${piece.id}`} key={piece.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{piece.name}</strong><small>{clothingCategoryLabel(piece.category)} · {piece.colors?.[0]?.name || 'cor a confirmar'}</small></div><b>↗</b></Link>)}</div> : <div className="app-empty"><span className="app-empty-mark">R</span><strong>Sua cápsula começa no closet.</strong><p>Cadastre algumas peças para o Roupzy montar uma seleção real.</p><Link className="app-primary-button" href="/app/closet/adicionar">Adicionar primeira peça <span>↗</span></Link></div>}</section>
      <aside className="rv-module-aside"><span>COMO USAR</span><h2>Uma seleção para uma intenção.</h2><ol><li>Escolha um contexto: semana, viagem ou estação.</li><li>Revise cores, camadas e níveis de formalidade.</li><li>Crie looks usando apenas a seleção.</li></ol><p>A seleção mostrada usa as peças disponíveis mais recentes. A gravação de cápsulas será liberada quando o módulo próprio estiver conectado ao banco.</p></aside>
    </div>
  </div>
}
