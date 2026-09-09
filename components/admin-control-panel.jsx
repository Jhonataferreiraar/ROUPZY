'use client'

import { useEffect, useState } from 'react'

import { adminStatusLabel, environmentLabel, feedbackCategoryLabel } from '@/lib/ui/labels'

function formatPrice(minor, currency = 'BRL') {
  return (Number(minor || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency })
}

function PlanControl({ plan, canManage, busy, onSave }) {
  const [form, setForm] = useState({
    name: plan.name || '',
    description: plan.description || '',
    priceMinor: String(plan.price_minor || 0),
    billingInterval: plan.billing_interval || 'month',
    displayOrder: String(plan.display_order || 0),
    active: Boolean(plan.active),
    limits: JSON.stringify(plan.limits || {}, null, 2),
    features: Array.isArray(plan.features) ? plan.features.join('\n') : ''
  })
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    setError('')
    let limits
    try {
      limits = JSON.parse(form.limits || '{}')
      if (!limits || Array.isArray(limits) || typeof limits !== 'object' || Object.values(limits).some((value) => !Number.isInteger(value) || value < 0)) throw new Error()
    } catch {
      setError('Os limites precisam ser um JSON com números inteiros iguais ou maiores que zero.')
      return
    }
    onSave({
      resource: 'plan',
      id: plan.id,
      name: form.name.trim(),
      description: form.description.trim(),
      priceMinor: Math.max(0, Number.parseInt(form.priceMinor || '0', 10)),
      billingInterval: form.billingInterval,
      active: form.active,
      displayOrder: Math.max(0, Number.parseInt(form.displayOrder || '0', 10)),
      limits,
      features: form.features.split('\n').map((feature) => feature.trim()).filter(Boolean)
    })
  }

  return <form noValidate className="admin-plan-card" onSubmit={submit}>
    <div className="admin-control-card-head"><div><span className="admin-code">{plan.code}</span><h3>{plan.name}</h3></div><span className={form.active ? 'admin-state is-on' : 'admin-state'}>{form.active ? 'Ativo' : 'Desativado'}</span></div>
    <div className="admin-plan-grid">
      <label><span>Nome</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} disabled={!canManage} /></label>
      <label><span>Preço em centavos</span><input type="number" min="0" value={form.priceMinor} onChange={(event) => setForm({ ...form, priceMinor: event.target.value })} disabled={!canManage} /><small>{formatPrice(form.priceMinor)}</small></label>
      <label><span>Cobrança</span><select value={form.billingInterval} onChange={(event) => setForm({ ...form, billingInterval: event.target.value })} disabled={!canManage}><option value="month">Mensal</option><option value="year">Anual</option><option value="one_time">Única</option></select></label>
      <label><span>Ordem de exibição</span><input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} disabled={!canManage} /></label>
      <label className="admin-plan-description"><span>Descrição</span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} disabled={!canManage} /></label>
      <label><span>Limites em JSON</span><textarea className="resize-none" rows="5" value={form.limits} onChange={(event) => setForm({ ...form, limits: event.target.value })} disabled={!canManage} /></label>
      <label><span>Recursos, um por linha</span><textarea className="resize-none" rows="5" value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} disabled={!canManage} /></label>
    </div>
    <div className="admin-control-card-actions"><label className="admin-toggle"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} disabled={!canManage} /><span>Disponível para venda</span></label>{canManage ? <button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar plano'}</button> : null}</div>
    {error ? <p className="admin-inline-error" role="alert">{error}</p> : null}
  </form>
}

export function FlagControl({ flag, canManage, busy, onSave }) {
  const [enabled, setEnabled] = useState(Boolean(flag.enabled))
  const [rolloutPercent, setRolloutPercent] = useState(String(flag.rollout_percent || 0))

  return <div className="admin-flag-row"><div><strong>{flag.key}</strong><small>Percentual de rollout: {flag.rollout_percent}%</small></div><label className="admin-toggle"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} disabled={!canManage} /><span>{enabled ? 'Ligada' : 'Desligada'}</span></label><input className="admin-rollout-input" type="number" min="0" max="100" value={rolloutPercent} onChange={(event) => setRolloutPercent(event.target.value)} disabled={!canManage} aria-label={'Rollout de ' + flag.key} />{canManage ? <button type="button" onClick={() => onSave({ resource: 'flag', key: flag.key, enabled, rolloutPercent: Number.parseInt(rolloutPercent || '0', 10) })} disabled={busy}>{busy ? '…' : 'Salvar'}</button> : null}</div>
}

function InboxRow({ item, type, canManage, busy, onSave }) {
  const [status, setStatus] = useState(item.status)
  const [response, setResponse] = useState(item.response || '')
  const isContact = type === 'contact'

  return <div className="admin-inbox-row"><div className="admin-inbox-copy"><div><span className="admin-code">{isContact ? item.subject : feedbackCategoryLabel(item.category)}</span><small>{isContact ? item.name + ' · ' + item.email : new Date(item.created_at).toLocaleString('pt-BR')}</small></div><p>{item.body}</p></div>{canManage ? <div className="admin-inbox-controls"><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status"><option value="new">Novo</option><option value={isContact ? 'in_progress' : 'reviewing'}>{isContact ? 'Em andamento' : 'Em análise'}</option><option value="resolved">Resolvido</option><option value={isContact ? 'spam' : 'archived'}>{isContact ? 'Spam' : 'Arquivado'}</option></select>{!isContact ? <textarea className="resize-none" rows="2" value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Resposta interna ou ao usuário" aria-label="Resposta" /> : null}<button type="button" onClick={() => onSave(isContact ? { resource: 'contact', id: item.id, status } : { resource: 'feedback', id: item.id, status, response })} disabled={busy}>{busy ? 'Salvando…' : 'Atualizar'}</button></div> : <span className="admin-state">{adminStatusLabel(status)}</span>}</div>
}

export function SettingControl({ setting, canManage, busy, onSave }) {
  const [value, setValue] = useState(JSON.stringify(setting.value, null, 2))
  const [error, setError] = useState('')

  function submit() {
    try {
      const parsed = JSON.parse(value)
      setError('')
      onSave({ resource: 'setting', key: setting.key, value: parsed })
    } catch {
      setError('Use um valor JSON válido.')
    }
  }

  return <div className="admin-setting-row"><div><strong>{setting.key}</strong><small>{environmentLabel(setting.environment)} · atualizado em {new Date(setting.updated_at).toLocaleString('pt-BR')}</small></div><textarea className="resize-none" value={value} onChange={(event) => setValue(event.target.value)} disabled={!canManage} aria-label={'Valor de ' + setting.key} />{canManage ? <button type="button" onClick={submit} disabled={busy}>{busy ? '…' : 'Salvar'}</button> : null}{error ? <p className="admin-inline-error">{error}</p> : null}</div>
}

function CreatePlanForm({ busy, onCreate }) {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    priceMinor: '0',
    billingInterval: 'month',
    displayOrder: '0',
    active: false,
    limits: '{\n  "maxClosetItems": 50,\n  "maxLookGenerationsPerMonth": 20,\n  "maxAiAnalysesPerMonth": 10,\n  "maxInspirationAnalysesPerMonth": 3\n}',
    features: ''
  })
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    setError('')
    let limits
    try {
      limits = JSON.parse(form.limits || '{}')
      if (!limits || Array.isArray(limits) || typeof limits !== 'object' || Object.values(limits).some((value) => !Number.isInteger(value) || value < 0)) throw new Error()
    } catch {
      setError('Os limites precisam ser um JSON com números inteiros iguais ou maiores que zero.')
      return
    }
    onCreate({
      resource: 'plan',
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      priceMinor: Math.max(0, Number.parseInt(form.priceMinor || '0', 10)),
      billingInterval: form.billingInterval,
      displayOrder: Math.max(0, Number.parseInt(form.displayOrder || '0', 10)),
      active: form.active,
      limits,
      features: form.features.split('\n').map((feature) => feature.trim()).filter(Boolean)
    })
  }

  return <details className="admin-create-card" open>
    <summary><span><b>+</b><strong>Novo plano</strong><small>Cadastre uma oferta e defina os limites do cliente.</small></span><em>abrir formulário</em></summary>
    <form noValidate className="admin-create-form" onSubmit={submit}>
      <div className="admin-create-form-grid">
        <label><span>Código interno</span><input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toLowerCase() })} placeholder="pro" pattern="[a-z0-9_-]{2,50}" /></label>
        <label><span>Nome exibido</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Closet completo" /></label>
        <label><span>Preço em centavos</span><input type="number" min="0" required value={form.priceMinor} onChange={(event) => setForm({ ...form, priceMinor: event.target.value })} /><small>{formatPrice(form.priceMinor)}</small></label>
        <label><span>Cobrança</span><select value={form.billingInterval} onChange={(event) => setForm({ ...form, billingInterval: event.target.value })}><option value="month">Mensal</option><option value="year">Anual</option><option value="one_time">Única</option></select></label>
        <label><span>Ordem de exibição</span><input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} /></label>
        <label className="admin-create-wide"><span>Descrição</span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Para quem quer mais espaço para se vestir." /></label>
        <label><span>Limites em JSON</span><textarea className="resize-none" rows="8" required value={form.limits} onChange={(event) => setForm({ ...form, limits: event.target.value })} /></label>
        <label><span>Recursos, um por linha</span><textarea className="resize-none" rows="8" value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} placeholder="Closet sem limite\nLooks personalizados\nSuporte prioritário" /></label>
      </div>
      <div className="admin-create-actions"><label className="admin-toggle"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /><span>Disponível para venda agora</span></label><button type="submit" disabled={busy}>{busy ? 'Cadastrando…' : 'Cadastrar plano'}</button></div>
      {error ? <p className="admin-inline-error" role="alert">{error}</p> : null}
    </form>
  </details>
}

export function CreateFlagForm({ busy, onCreate }) {
  const [form, setForm] = useState({ key: '', enabled: false, rolloutPercent: '100' })

  function submit(event) {
    event.preventDefault()
    onCreate({ resource: 'flag', key: form.key.trim(), enabled: form.enabled, rolloutPercent: Number.parseInt(form.rolloutPercent || '0', 10) })
  }

  return <details className="admin-create-card admin-create-card-compact" open>
    <summary><span><b>+</b><strong>Nova flag</strong><small>Libere funcionalidades de forma controlada.</small></span><em>abrir formulário</em></summary>
    <form noValidate className="admin-create-form" onSubmit={submit}>
      <div className="admin-create-form-grid admin-create-form-grid-three"><label><span>Chave</span><input required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value.toLowerCase() })} placeholder="new_recommendations" pattern="[a-z0-9_-]{1,120}" /></label><label><span>Rollout (%)</span><input type="number" min="0" max="100" required value={form.rolloutPercent} onChange={(event) => setForm({ ...form, rolloutPercent: event.target.value })} /></label><div className="admin-create-check"><span>Status inicial</span><label className="admin-toggle"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /><span>Ligada</span></label></div></div>
      <div className="admin-create-actions"><span className="admin-form-hint">A flag fica registrada na auditoria e pode ser alterada a qualquer momento.</span><button type="submit" disabled={busy}>{busy ? 'Cadastrando…' : 'Cadastrar flag'}</button></div>
    </form>
  </details>
}

export function CreateSettingForm({ busy, onCreate }) {
  const [form, setForm] = useState({ key: '', value: '{}' })
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    try {
      const value = JSON.parse(form.value)
      setError('')
      onCreate({ resource: 'setting', key: form.key.trim(), value })
    } catch {
      setError('Use um valor JSON válido, como {"enabled":true} ou "Roupzy".')
    }
  }

  return <details className="admin-create-card admin-create-card-compact" open>
    <summary><span><b>+</b><strong>Nova configuração</strong><small>Salve parâmetros globais usados pelo produto.</small></span><em>abrir formulário</em></summary>
    <form noValidate className="admin-create-form" onSubmit={submit}>
      <div className="admin-create-form-grid admin-create-form-grid-settings"><label><span>Chave</span><input required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value.toLowerCase() })} placeholder="public.site_name" pattern="[a-z0-9_.-]{1,120}" /></label><label><span>Valor em JSON</span><textarea className="resize-none" rows="4" required value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder='{"enabled":true}' /></label></div>
      <div className="admin-create-actions"><span className="admin-form-hint">Use apenas valores de configuração. Secrets continuam no ambiente do servidor.</span><button type="submit" disabled={busy}>{busy ? 'Cadastrando…' : 'Cadastrar configuração'}</button></div>
      {error ? <p className="admin-inline-error" role="alert">{error}</p> : null}
    </form>
  </details>
}

export function AdminSupportPanel({ canManage = false, initialData = null }) {
  const [data, setData] = useState(initialData || { feedback: [], contacts: [] })
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })
  const [busyKey, setBusyKey] = useState('')

  async function load() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/control?section=support', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar a caixa de entrada.')
      setData({ feedback: result.feedback || [], contacts: result.contacts || [] })
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar a caixa de entrada.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  async function save(payload, key) {
    setBusyKey(key || payload.resource)
    try {
      const response = await fetch('/api/admin/control', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar esse atendimento.')
      setState({ status: 'idle', message: 'Atendimento atualizado e registrado na auditoria.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar esse atendimento.' })
    } finally {
      setBusyKey('')
    }
  }

  if (state.status === 'loading' && !data.feedback.length && !data.contacts.length) return <section className="admin-support-panel admin-panel-card"><p className="admin-muted">Carregando caixa de entrada…</p></section>

  return <section className="admin-support-panel admin-panel-card"><div className="app-section-label"><span>Relacionamento</span><span>{canManage ? 'gestão de atendimento' : 'somente leitura'}</span></div><p className="admin-control-lead">Acompanhe mensagens de contato e feedbacks do produto em uma área dedicada. Toda atualização fica registrada na auditoria.</p>{state.message ? <p className={'admin-users-feedback admin-users-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}<div className="admin-support-summary"><div><span>Contatos</span><strong>{data.contacts.length}</strong><small>últimas solicitações</small></div><div><span>Feedbacks</span><strong>{data.feedback.length}</strong><small>retornos do produto</small></div><div><span>Em aberto</span><strong>{data.contacts.filter((item) => item.status !== 'resolved' && item.status !== 'spam').length + data.feedback.filter((item) => item.status !== 'resolved' && item.status !== 'archived').length}</strong><small>precisam de atenção</small></div></div><div className="admin-control-section admin-support-inbox"><div className="admin-control-section-head"><div><span className="app-kicker">Fila de atendimento</span><h2>Caixa de entrada</h2></div><small>Contato e feedback ficam aqui até serem tratados.</small></div><div className="admin-inbox-list">{data.contacts.map((item) => <InboxRow key={'contact-' + item.id + '-' + item.status} item={item} type="contact" canManage={canManage} busy={busyKey === item.id} onSave={(payload) => save(payload, item.id)} />)}{data.feedback.map((item) => <InboxRow key={'feedback-' + item.id + '-' + item.status + '-' + item.response} item={item} type="feedback" canManage={canManage} busy={busyKey === item.id} onSave={(payload) => save(payload, item.id)} />)}{!data.contacts.length && !data.feedback.length ? <p className="admin-muted">Nenhuma mensagem ou feedback recebido.</p> : null}</div></div></section>
}

export function AdminControlPanel({ canManage = false, initialData = null }) {
  const [data, setData] = useState(initialData || { plans: [] })
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })
  const [busyKey, setBusyKey] = useState('')

  async function load() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/control?section=product', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os controles.')
      setData(result)
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar os controles.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  async function save(payload, key) {
    setBusyKey(key || payload.resource)
    try {
      const response = await fetch('/api/admin/control', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar essa alteração.')
      setState({ status: 'idle', message: 'Alteração salva e registrada na auditoria.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar essa alteração.' })
    } finally {
      setBusyKey('')
    }
  }

  async function create(payload, key) {
    setBusyKey(key || payload.resource)
    try {
      const response = await fetch('/api/admin/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível cadastrar esse item.')
      setState({ status: 'idle', message: 'Cadastro realizado e registrado na auditoria.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível cadastrar esse item.' })
    } finally {
      setBusyKey('')
    }
  }

  if (state.status === 'loading' && !data.plans.length) return <section className="admin-control-panel"><p className="admin-muted">Carregando planos…</p></section>

  return <section className="admin-control-panel"><div className="app-section-label"><span>Controles do produto</span><span>{canManage ? 'modo proprietário' : 'somente leitura'}</span></div><p className="admin-control-lead">Cadastre ofertas, ligue recursos, publique o conteúdo institucional e configure o comportamento do site. Toda alteração fica registrada na auditoria.</p>{state.message ? <p className={'admin-users-feedback admin-users-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    <div className="admin-control-section"><div className="admin-control-section-head"><div><span className="app-kicker">Monetização</span><h2>Planos e limites</h2></div><small>Preços em centavos de BRL. A cobrança real só é ativada quando um provedor for conectado.</small></div>{canManage ? <CreatePlanForm busy={busyKey === 'plan'} onCreate={(payload) => create(payload, 'plan')} /> : null}{data.plans.length ? <div className="admin-plan-list">{data.plans.map((plan) => <PlanControl key={plan.id + '-' + plan.updated_at + '-' + plan.name + '-' + plan.price_minor} plan={plan} canManage={canManage} busy={busyKey === plan.id} onSave={(payload) => save(payload, plan.id)} />)}</div> : <p className="admin-muted">Nenhum plano cadastrado ainda. Use o formulário acima para criar o primeiro.</p>}</div>
  </section>
}

export function AdminSettingsPanel({ canManage = false, initialData = null }) {
  const [data, setData] = useState(initialData || { settings: [], flags: [] })
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })
  const [busyKey, setBusyKey] = useState('')

  async function load() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/control?section=settings', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar as configurações.')
      setData({ settings: result.settings || [], flags: result.flags || [] })
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar as configurações.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  async function save(payload, key) {
    setBusyKey(key || payload.resource)
    try {
      const response = await fetch('/api/admin/control', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar essa configuração.')
      setState({ status: 'idle', message: 'Configuração salva e registrada na auditoria.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar essa configuração.' })
    } finally {
      setBusyKey('')
    }
  }

  async function create(payload, key) {
    setBusyKey(key || payload.resource)
    try {
      const response = await fetch('/api/admin/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível cadastrar essa configuração.')
      setState({ status: 'idle', message: 'Cadastro realizado e registrado na auditoria.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível cadastrar essa configuração.' })
    } finally {
      setBusyKey('')
    }
  }

  if (state.status === 'loading' && !data.settings.length && !data.flags.length) return <section className="admin-control-panel"><p className="admin-muted">Carregando configurações…</p></section>

  return <section className="admin-control-panel"><div className="app-section-label"><span>Configurações do sistema</span><span>{canManage ? 'modo proprietário' : 'somente leitura'}</span></div><p className="admin-control-lead">Ative recursos gradualmente e mantenha parâmetros globais sob controle. Secrets continuam no ambiente seguro do servidor. Toda alteração fica registrada na auditoria.</p>{state.message ? <p className={'admin-users-feedback admin-users-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    <div className="admin-control-columns"><div className="admin-control-section"><div className="admin-control-section-head"><div><span className="app-kicker">Lançamentos</span><h2>Flags do produto</h2></div><small>Libere funcionalidades de forma gradual e reversível.</small></div>{canManage ? <CreateFlagForm busy={busyKey === 'flag'} onCreate={(payload) => create(payload, 'flag')} /> : null}{data.flags.length ? data.flags.map((flag) => <FlagControl key={flag.key + '-' + flag.updated_at + '-' + flag.enabled + '-' + flag.rollout_percent} flag={flag} canManage={canManage} busy={busyKey === flag.key} onSave={(payload) => save(payload, flag.key)} />) : <p className="admin-muted">Nenhuma flag cadastrada. Use o formulário acima para criar uma.</p>}</div><div className="admin-control-section"><div className="admin-control-section-head"><div><span className="app-kicker">Parâmetros</span><h2>Configurações globais</h2></div><small>Valores em JSON para integrações e regras do produto.</small></div>{canManage ? <CreateSettingForm busy={busyKey === 'setting'} onCreate={(payload) => create(payload, 'setting')} /> : null}{data.settings.length ? data.settings.map((setting) => <SettingControl key={setting.key + '-' + setting.updated_at + '-' + JSON.stringify(setting.value)} setting={setting} canManage={canManage} busy={busyKey === setting.key} onSave={(payload) => save(payload, setting.key)} />) : <p className="admin-muted">Nenhuma configuração global cadastrada. Use o formulário acima para criar uma.</p>}</div></div>
  </section>
}
