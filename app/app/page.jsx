import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getAuthContext } from '@/lib/auth/server'
import { clothingCategoryLabel } from '@/lib/ui/labels'

export const dynamic = 'force-dynamic'

function shortDate(value) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function firstNameFrom(value) {
  const name = String(value || 'pessoa').trim().split(/\s+/)[0] || 'pessoa'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export default async function AppHomePage() {
  const { supabase, user, profile } = await getAuthContext()
  const weekStart = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const results = await Promise.all([
    supabase.from('clothing_items').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).is('deleted_at', null),
    supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('outfit_feedback').select('outfit_id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('kind', 'favorited'),
    supabase.from('outfit_history').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('clothing_items').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).is('deleted_at', null).neq('analysis_status', 'ready'),
    supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).gte('created_at', weekStart),
    supabase.from('outfits').select('id, occasion, vibe, explanation, created_at').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('clothing_items').select('id, name, category, colors, analysis_status, created_at').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(4)
  ])
  if (results.some((result) => result.error)) throw new Error('Não foi possível carregar os dados do seu espaço.')
  const [
    { count: closetCount },
    { count: lookCount },
    { count: favoriteCount },
    { count: usedCount },
    { count: pendingCount },
    { count: weekLookCount },
    { data: recentLooks },
    { data: recentItems }
  ] = results

  if (profile?.onboarding_status === 'not_started' && !closetCount) redirect('/app/onboarding')

  const totalPieces = closetCount || 0
  const pendingPieces = pendingCount || 0
  const analyzedPercent = totalPieces ? Math.round((Math.max(totalPieces - pendingPieces, 0) / totalPieces) * 100) : 0
  const firstName = firstNameFrom(profile?.display_name)
  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  const actionItems = [
    totalPieces < 3
      ? { number: '01', title: 'Alimente seu arquivo', detail: `Adicione ${3 - totalPieces} ${3 - totalPieces === 1 ? 'peça' : 'peças'} para liberar suas primeiras combinações.`, href: '/app/closet/adicionar' }
      : { number: '01', title: 'Criar uma combinação', detail: 'Escolha uma ocasião e deixe o motor cruzar seu closet.', href: '/app/looks/criar' },
    pendingPieces
      ? { number: '02', title: 'Revisar análises', detail: `${pendingPieces} ${pendingPieces === 1 ? 'peça aguarda' : 'peças aguardam'} sua confirmação.`, href: '/app/closet' }
      : { number: '02', title: 'Trazer uma inspiração', detail: 'Salve uma referência e encontre caminhos no seu próprio arquivo.', href: '/app/inspiracao' },
    { number: '03', title: 'Ler seu histórico', detail: usedCount ? `${usedCount} ${usedCount === 1 ? 'uso registrado' : 'usos registrados'} no seu espaço.` : 'Veja as combinações que já ganharam um dia.', href: '/app/looks/historico' }
  ]
  const activity = [
    ...(recentLooks || []).map((look) => ({ type: 'look', date: look.created_at, title: look.vibe || 'Combinação registrada', detail: look.occasion || 'Ocasião não informada', href: '/app/looks' })),
    ...(recentItems || []).map((item) => ({ type: 'piece', date: item.created_at, title: item.name, detail: clothingCategoryLabel(item.category), href: '/app/closet/' + item.id }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="app-page app-dashboard-page shell">
      <section className="dashboard-command-center">
        <div className="dashboard-command-copy">
          <div className="dashboard-eyebrow"><i aria-hidden="true" /> PAINEL PESSOAL / {todayLabel}</div>
          <h1>Olá, {firstName}.<br />{' '}<em>O que você vai vestir?</em></h1>
          <p>Seu armário é a fonte. O Roupzy organiza as possibilidades e deixa a escolha mais leve.</p>
          <div className="dashboard-hero-actions">
            <Link className="app-primary-button" href="/app/looks/criar">Criar uma combinação <span aria-hidden="true">↗</span></Link>
            <Link className="app-outline-button" href="/app/closet/adicionar">Adicionar peça <span aria-hidden="true">+</span></Link>
          </div>
        </div>
        <div className="dashboard-console" aria-label="Resumo do estado do seu armário">
          <div className="dashboard-console-grid" aria-hidden="true" />
          <div className="dashboard-console-head"><span>Leitura do armário</span><span className="dashboard-live"><i aria-hidden="true" /> atualizado</span></div>
          <div className="dashboard-console-main"><span className="dashboard-orbit dashboard-orbit-one" aria-hidden="true" /><span className="dashboard-orbit dashboard-orbit-two" aria-hidden="true" /><strong>{totalPieces}</strong><span>peças no arquivo</span></div>
          <div className="dashboard-console-bottom">
            <div><small>ANALISADAS</small><strong>{analyzedPercent}%</strong></div>
            <div><small>LOOKS / 7 DIAS</small><strong>{weekLookCount || 0}</strong></div>
            <div><small>ÚLTIMO PASSO</small><strong>{pendingPieces ? 'Revisar' : totalPieces >= 3 ? 'Escolher' : 'Adicionar'}</strong></div>
          </div>
          <div className="dashboard-progress" aria-label={`${analyzedPercent}% das peças analisadas`}><span style={{ width: `${analyzedPercent}%` }} /></div>
        </div>
      </section>

      <div className="dashboard-section-heading"><div><span className="dashboard-section-kicker">CENTRAL DE CONTROLE</span><h2>Seu espaço agora</h2></div><span className="dashboard-updated">Dados da sua conta</span></div>

      <section className="dashboard-metrics" aria-label="Indicadores do espaço pessoal">
        <Link className="dashboard-metric dashboard-metric-blue" href="/app/closet"><span>PEÇAS NO CLOSET</span><strong>{totalPieces}</strong><small>abrir arquivo <b aria-hidden="true">↗</b></small></Link>
        <Link className="dashboard-metric dashboard-metric-coral" href="/app/looks"><span>LOOKS CRIADOS</span><strong>{lookCount || 0}</strong><small>ver combinações <b aria-hidden="true">↗</b></small></Link>
        <Link className="dashboard-metric dashboard-metric-sky" href="/app/favoritos"><span>FAVORITOS</span><strong>{favoriteCount || 0}</strong><small>o que vale repetir <b aria-hidden="true">↗</b></small></Link>
        <Link className="dashboard-metric dashboard-metric-paper" href="/app/estatisticas"><span>USOS REGISTRADOS</span><strong>{usedCount || 0}</strong><small>ler meu ritmo <b aria-hidden="true">↗</b></small></Link>
      </section>

      <section className="dashboard-primary-grid">
        <section className="dashboard-panel dashboard-actions-panel" aria-labelledby="dashboard-actions-title">
          <div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">PRÓXIMOS PASSOS</span><h2 id="dashboard-actions-title">O que pede atenção</h2></div><span>03 caminhos</span></div>
          <div className="dashboard-action-list">{actionItems.map((item) => <Link className="dashboard-action-row" href={item.href} key={item.number}><span className="dashboard-action-number">{item.number}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><b aria-hidden="true">↗</b></Link>)}</div>
        </section>
        <section className="dashboard-panel dashboard-health-panel" aria-labelledby="dashboard-health-title">
          <div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">STATUS DO SISTEMA</span><h2 id="dashboard-health-title">Seu armário está</h2></div><span className="dashboard-ready"><i aria-hidden="true" /> {pendingPieces ? 'em revisão' : 'em ordem'}</span></div>
          <div className="dashboard-health-score"><strong>{analyzedPercent}%</strong><span>do arquivo<br />{' '}pronto para leitura</span></div>
          <div className="dashboard-health-bar"><span style={{ width: `${analyzedPercent}%` }} /></div>
          <div className="dashboard-health-list"><div><i className={totalPieces >= 3 ? 'is-ready' : ''} aria-hidden="true" /><span>Base mínima para criar looks</span><b>{totalPieces >= 3 ? 'Pronta' : 'Pendente'}</b></div><div><i className={!pendingPieces ? 'is-ready' : ''} aria-hidden="true" /><span>Dados das peças revisados</span><b>{pendingPieces ? `${pendingPieces} pendentes` : 'Tudo certo'}</b></div><div><i className={lookCount ? 'is-ready' : ''} aria-hidden="true" /><span>Histórico de combinações</span><b>{lookCount ? 'Ativo' : 'Comece agora'}</b></div></div>
        </section>
      </section>

      <section className="dashboard-secondary-grid">
        <section className="dashboard-panel dashboard-activity-panel" aria-labelledby="dashboard-activity-title">
          <div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">MOVIMENTO RECENTE</span><h2 id="dashboard-activity-title">O que mudou</h2></div><Link href="/app/looks">Ver tudo ↗</Link></div>
          {activity.length ? <div className="dashboard-activity-list">{activity.map((item, index) => <Link className="dashboard-activity-row" href={item.href} key={`${item.type}-${item.date}-${index}`}><span className={`dashboard-activity-mark ${item.type === 'look' ? 'is-look' : 'is-piece'}`} aria-hidden="true">{item.type === 'look' ? 'L' : 'P'}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{shortDate(item.date)}</time></Link>)}</div> : <div className="dashboard-empty-inline"><strong>Seu painel começa quando você registra algo.</strong><p>Adicione uma peça para o arquivo ganhar movimento.</p><Link className="app-outline-button" href="/app/closet/adicionar">Adicionar primeira peça <span aria-hidden="true">↗</span></Link></div>}
        </section>
        <section className="dashboard-panel dashboard-archive-panel" aria-labelledby="dashboard-archive-title">
          <div className="dashboard-panel-heading"><div><span className="dashboard-panel-kicker">ÚLTIMAS PEÇAS</span><h2 id="dashboard-archive-title">Seu arquivo</h2></div><Link href="/app/closet">Abrir closet ↗</Link></div>
          {recentItems?.length ? <div className="dashboard-item-list">{recentItems.map((item, index) => <Link className="dashboard-item-row" href={`/app/closet/${item.id}`} key={item.id}><span className={`dashboard-item-shape dashboard-item-shape-${(index % 3) + 1}`} aria-hidden="true" /><span><strong>{item.name}</strong><small>{clothingCategoryLabel(item.category)} · {item.analysis_status === 'ready' ? 'analisada' : 'aguarda revisão'}</small></span><b aria-hidden="true">↗</b></Link>)}</div> : <div className="dashboard-empty-inline"><strong>Nenhuma peça registrada ainda.</strong><p>Comece pelo que já está no seu armário.</p><Link className="app-outline-button" href="/app/closet/adicionar">Adicionar peça <span aria-hidden="true">+</span></Link></div>}
        </section>
      </section>
    </div>
  )
}
