'use client'

import { useCallback, useEffect, useState } from 'react'

import { adminActionLabel, adminOutcomeLabel, adminResourceLabel, adminRoleLabel } from '@/lib/ui/labels'

function AuditRow({ event }) {
  return <article className="admin-audit-row"><div className={'admin-audit-outcome ' + event.outcome}>{adminOutcomeLabel(event.outcome)}</div><div className="admin-audit-event"><strong>{adminActionLabel(event.action)}</strong><span>{adminResourceLabel(event.resource_type)}{event.resource_id ? ' · ' + event.resource_id : ''}</span>{event.metadata && Object.keys(event.metadata).length ? <details><summary>Metadados</summary><code>{JSON.stringify(event.metadata, null, 2)}</code></details> : null}</div><div className="admin-audit-actor"><strong>{event.actor_role ? adminRoleLabel(event.actor_role) : 'sistema'}</strong><span>{event.actor_id ? event.actor_id.slice(0, 8) : 'automático'}</span></div><time>{new Date(event.created_at).toLocaleString('pt-BR')}</time></article>
}

export function AdminAuditPanel({ initialData = null }) {
  const [logs, setLogs] = useState(initialData || [])
  const [outcome, setOutcome] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })

  const load = useCallback(async () => {
    setState({ status: 'loading', message: '' })
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (outcome) params.set('outcome', outcome)
      if (resourceType.trim()) params.set('resourceType', resourceType.trim().toLowerCase())
      const response = await fetch('/api/admin/audit?' + params.toString(), { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar a auditoria.')
      setLogs(result.logs || [])
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar a auditoria.' })
    }
  }, [outcome, resourceType])

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
    // Filters are submitted explicitly; this effect is intentionally initial-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  return <section className="admin-audit-panel admin-panel-card"><div className="app-section-label"><span>Trilha de controle</span><span>até 200 eventos</span></div><p className="admin-control-lead">Veja quem alterou o quê, quando aconteceu e se a operação foi concluída. A auditoria ajuda a investigar falhas e manter o controle do negócio.</p><form noValidate className="admin-audit-filters" onSubmit={(event) => { event.preventDefault(); load() }}><label><span>Resultado</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="">Todos</option><option value="success">Sucesso</option><option value="denied">Negado</option><option value="failed">Falha</option></select></label><label><span>Tipo de recurso</span><input value={resourceType} onChange={(event) => setResourceType(event.target.value)} placeholder="usuário, plano, ia..." /></label><button type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Atualizando…' : 'Filtrar registros'}</button></form>{state.message ? <p className="admin-users-feedback admin-users-feedback-error" role="alert">{state.message}</p> : null}<div className="admin-audit-list"><div className="admin-audit-list-head"><span>Resultado</span><span>Evento</span><span>Responsável</span><span>Quando</span></div>{logs.length ? logs.map((event) => <AuditRow event={event} key={event.id} />) : state.status === 'loading' ? <p className="admin-muted">Carregando auditoria…</p> : <p className="admin-muted">Nenhum evento encontrado.</p>}</div></section>
}
