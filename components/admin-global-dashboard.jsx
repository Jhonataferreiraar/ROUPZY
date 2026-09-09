'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { adminActionLabel, adminOutcomeLabel, adminResourceLabel, adminRoleLabel } from '@/lib/ui/labels'

const emptyData = {
  metrics: {},
  onboarding: {},
  signups: [],
  audit: [],
  health: { database: false, ai: false, billing: false, storage: false }
}

function Metric({ index, label, value, note, tone = '' }) {
  return <article className={'admin-global-metric ' + tone}><div className="admin-metric-heading"><span>{label}</span><b>{String(index).padStart(2, '0')}</b></div><strong>{value ?? '—'}</strong><small>{note}</small></article>
}

export function AdminGlobalDashboard({ role = 'owner', email = '', initialData = null }) {
  const [data, setData] = useState(initialData || emptyData)
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })

  async function load() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o painel global.')
      setData(result)
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar o painel global.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  const maxSignup = useMemo(() => Math.max(...(data.signups || []).map((item) => item.value), 1), [data.signups])
  const healthItems = [
    ['Banco de dados', data.health?.database],
    ['Storage privado', data.health?.storage],
    ['Análise de IA', data.health?.ai],
    ['Cobrança', data.health?.billing]
  ]

  return <>
    <section className="admin-global-hero admin-command-hero" id="overview">
      <div className="admin-global-hero-top"><div className="admin-hero-account"><span className="admin-global-mark">R</span><div><span className="admin-global-kicker">ROUPZY / CONTROLE GERAL</span><p>Conta proprietária · {email || 'acesso autenticado'}</p></div></div><div className="admin-command-top-actions"><span className="admin-global-role">{adminRoleLabel(role)}</span><button className="admin-refresh-control" type="button" onClick={load} disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Atualizando…' : 'Atualizar dados'}</button></div></div>
      <div className="admin-global-hero-content"><div className="admin-command-copy"><div className="admin-command-label-row"><span className="admin-global-kicker">CENTRAL DO NEGÓCIO</span><span className="admin-command-live"><i /> Operação acompanhada</span></div><h1>O produto inteiro<br />{' '}<em>em perspectiva.</em></h1><p>Usuários, produto, receita, operação e segurança reunidos em uma visão feita para quem decide.</p><div className="admin-command-actions"><Link className="admin-primary-action" href="/admin/usuarios">Gerenciar usuários <span aria-hidden="true">↗</span></Link><a className="admin-secondary-action" href="#activity">Ver atividade</a></div></div><div className="admin-command-readout"><span className="admin-readout-label">LEITURA DO AMBIENTE</span><div><small>Acesso atual</small><strong>{adminRoleLabel(role)}</strong></div><div><small>Escopo</small><strong>Controle global</strong></div><div><small>Dados</small><strong>Produto conectado</strong></div><span className="admin-readout-foot"><i /> Sessão protegida e monitorada</span></div></div>
    </section>
    {state.message ? <p className="admin-global-feedback" role="alert">{state.message}</p> : null}
    <div className="admin-dashboard-section-heading"><div><span className="admin-global-kicker">LEITURA RÁPIDA</span><h2>O que está movendo o Roupzy</h2></div><span>Indicadores do ambiente atual</span></div>
    <section className="admin-global-metrics" aria-label="Métricas globais">
      <Metric index={1} label="Usuários totais" value={data.metrics.totalUsers} note="contas criadas" tone="is-blue" />
      <Metric index={2} label="Usuários ativos" value={data.metrics.activeUsers} note="atividade nos últimos 30 dias" tone="is-lime" />
      <Metric index={3} label="Novos cadastros" value={data.metrics.newUsers} note="últimos 30 dias" tone="is-coral" />
      <Metric index={4} label="Peças catalogadas" value={data.metrics.pieces} note="closets ativos" />
      <Metric index={5} label="Looks gerados" value={data.metrics.looks} note="combinações criadas" />
      <Metric index={6} label="Assinaturas ativas" value={data.metrics.activeSubscriptions} note="confirmadas pelo provedor" tone="is-violet" />
    </section>
    <div className="admin-dashboard-section-heading admin-dashboard-section-heading-workspace"><div><span className="admin-global-kicker">OPERAÇÃO</span><h2>Ritmo e saúde do produto</h2></div><span>Atualizado a partir dos registros reais</span></div>
    <section className="admin-global-workspace" id="activity">
      <div className="admin-global-panel admin-global-chart-panel"><div className="admin-global-panel-head"><div><span className="admin-global-kicker">CRESCIMENTO</span><h2>Novos cadastros</h2></div><span>últimos 14 dias</span></div><div className="admin-signup-chart" aria-label="Gráfico de novos cadastros">{(data.signups || []).map((item) => <div className="admin-signup-column" key={item.day}><div className="admin-signup-bar-wrap"><div className="admin-signup-bar" style={{ height: ((item.value / maxSignup) * 100) + '%' }} title={item.value + ' cadastros'} /></div><small>{item.day}</small></div>)}</div><div className="admin-chart-total"><strong>{data.metrics.newUsers ?? '—'}</strong><span>novos usuários no período</span></div></div>
      <div className="admin-global-panel admin-global-health-panel"><div className="admin-global-panel-head"><div><span className="admin-global-kicker">SISTEMA</span><h2>Pulso operacional</h2></div><span className="admin-live-label"><i /> ao vivo</span></div><div className="admin-health-list">{healthItems.map(([label, enabled]) => <div key={label}><span className={enabled ? 'is-ready' : 'is-pending'} /><strong>{label}</strong><small>{enabled ? 'configurado' : 'aguardando configuração'}</small></div>)}</div><div className="admin-health-note">{data.metrics.aiFailures ? <><strong>{data.metrics.aiFailures}</strong> falhas de IA nas últimas chamadas registradas.</> : 'Nenhuma falha de IA registrada no período analisado.'}</div></div>
      <div className="admin-global-panel admin-global-onboarding-panel"><div className="admin-global-panel-head"><div><span className="admin-global-kicker">ATIVAÇÃO</span><h2>Jornada das contas</h2></div></div><div className="admin-onboarding-rings"><div><strong>{data.onboarding?.completed || 0}</strong><span>ativadas</span></div><div><strong>{data.onboarding?.in_progress || 0}</strong><span>em andamento</span></div><div><strong>{data.onboarding?.not_started || 0}</strong><span>não iniciadas</span></div></div><p>Use essa leitura para entender onde as pessoas abandonam o primeiro cadastro do closet.</p></div>
      <div className="admin-global-panel admin-global-ops-panel"><div className="admin-global-panel-head"><div><span className="admin-global-kicker">OPERAÇÃO</span><h2>O que está acontecendo</h2></div></div><div className="admin-ops-list"><div><span>Chamadas de IA</span><strong>{data.metrics.aiCalls ?? '—'}</strong><small>{data.metrics.aiLatency || '—'} de latência média</small></div><div><span>Custo registrado</span><strong>{data.metrics.aiCost || '—'}</strong><small>estimativa acumulada da amostra</small></div><div><span>Receita registrada</span><strong>{data.metrics.revenue || '—'}</strong><small>eventos de cobrança confirmados</small></div><div><span>Caixa de entrada</span><strong>{(data.metrics.newContacts || 0) + (data.metrics.newFeedback || 0)}</strong><small>{data.metrics.newContacts || 0} contatos · {data.metrics.newFeedback || 0} feedbacks</small></div><div><span>Looks usados</span><strong>{data.metrics.used ?? '—'}</strong><small>{data.metrics.favorites || 0} favoritos registrados</small></div></div></div>
    </section>
    <section className="admin-global-panel admin-global-audit-panel" id="audit"><div className="admin-global-panel-head"><div><span className="admin-global-kicker">TRILHA DE CONTROLE</span><h2>Últimos registros</h2></div><span>eventos recentes</span></div>{data.audit?.length ? <div className="admin-global-log-list">{data.audit.map((event) => <div className="admin-global-log" key={event.id}><span className={'admin-log-outcome ' + event.outcome}>{adminOutcomeLabel(event.outcome)}</span><div><strong>{adminActionLabel(event.action)}</strong><small>{adminResourceLabel(event.resource_type)}{event.resource_id ? ' · ' + event.resource_id.slice(0, 8) : ''}</small></div><time>{new Date(event.created_at).toLocaleString('pt-BR')}</time></div>)}</div> : <p className="admin-muted">Ainda não há registros.</p>}</section>
  </>
}
