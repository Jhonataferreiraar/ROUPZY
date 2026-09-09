import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cuidados com as peças', robots: { index: false, follow: false } }

export default async function CarePage() {
  const { supabase, user } = await getAuthContext()
  const { data, error } = await supabase.from('clothing_items').select('id, name, availability, notes').eq('owner_id', user.id).is('deleted_at', null).in('availability', ['laundry', 'repair']).order('updated_at', { ascending: false })
  if (error) throw new Error('Não foi possível carregar os cuidados.')
  const items = data || []

  return <div className="app-page shell rv-module-page">
    <header className="rv-module-hero"><div><span className="app-kicker">VIDA ÚTIL DAS PEÇAS</span><h1>Cuidar também<br />{' '}<em>faz parte do look.</em></h1><p>Acompanhe o que está na lavanderia ou em conserto para que as sugestões usem apenas peças disponíveis.</p></div><Link className="app-outline-button" href="/app/closet">Atualizar situações <span>↗</span></Link></header>
    <section className="rv-module-panel"><div className="rv-module-panel-head"><div><span>ATENÇÃO AGORA</span><h2>Peças fora do closet</h2></div><strong>{items.length} em cuidado</strong></div>{items.length ? <div className="rv-care-list">{items.map((item) => <Link href={`/app/closet/${item.id}`} key={item.id}><i className={item.availability === 'repair' ? 'is-repair' : ''} /><div><strong>{item.name}</strong><small>{item.availability === 'repair' ? 'Em conserto' : 'Na lavanderia'}{item.notes ? ` · ${item.notes}` : ''}</small></div><span>Atualizar ↗</span></Link>)}</div> : <div className="app-empty"><span className="app-empty-mark">✓</span><strong>Todas as peças estão disponíveis.</strong><p>Quando você marcar uma peça para lavagem ou conserto, ela aparece aqui.</p></div>}</section>
  </div>
}
