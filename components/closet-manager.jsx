'use client'

/* Signed Supabase URLs are private and dynamic, so they cannot use a static Next image host. */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useState } from 'react'

import { BrandMark } from '@/components/brand'
import { clothingCategoryLabel } from '@/lib/ui/labels'

const categories = [
  ['unknown', 'A confirmar'],
  ['top', 'Parte de cima'],
  ['bottom', 'Parte de baixo'],
  ['one_piece', 'Peça única'],
  ['outerwear', 'Terceira peça'],
  ['shoe', 'Sapato'],
  ['bag', 'Bolsa'],
  ['accessory', 'Acessório']
]

const analysisFilters = [
  ['all', 'Todas as análises'],
  ['ready', 'Analisadas'],
  ['pending', 'Aguardando análise']
]

const availabilityFilters = [
  ['all', 'Todas as situações'],
  ['active', 'Disponíveis'],
  ['laundry', 'Na lavanderia'],
  ['repair', 'Em conserto']
]

const availabilityLabels = {
  active: 'disponível',
  laundry: 'na lavanderia',
  repair: 'em conserto',
  archived: 'arquivada'
}

const initialForm = {
  name: '',
  category: 'top',
  color: 'neutro',
  formality: 3,
  notes: '',
  file: null
}

export function ClosetManager({ initialItems = [], addOnly = false }) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: 'top', color: 'neutro', formality: 3 })
  const [analyzingId, setAnalyzingId] = useState(null)
  const [archivingId, setArchivingId] = useState(null)
  const [filters, setFilters] = useState({ search: '', category: 'all', analysis: 'all', availability: 'all' })
  const [state, setState] = useState({ status: 'idle', message: '' })
  const [availabilityId, setAvailabilityId] = useState(null)

  const visibleItems = items.filter((item) => {
    const search = filters.search.trim().toLowerCase()
    const matchesSearch = !search || [item.name, item.category, item.colors?.[0]?.name, item.colors?.[0]?.family].some((value) => String(value || '').toLowerCase().includes(search))
    const matchesCategory = filters.category === 'all' || item.category === filters.category
    const matchesAnalysis = filters.analysis === 'all' || (filters.analysis === 'ready' ? item.analysis_status === 'ready' : item.analysis_status !== 'ready')
    const matchesAvailability = filters.availability === 'all' || (item.availability || 'active') === filters.availability
    return matchesSearch && matchesCategory && matchesAnalysis && matchesAvailability
  })

  async function analyzeItem(id, silent = false) {
    setAnalyzingId(id)
    if (!silent) setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/closet/' + id + '/analyze', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível analisar essa peça agora.' })
        return false
      }
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...result.attributes, weather_range: result.attributes.weatherRange, analysis_status: 'ready', analysis_version: result.analysisVersion || item.analysis_version } : item))
      setState({ status: 'success', message: result.reused ? 'Esta peça já estava analisada.' : 'A análise foi concluída. Revise os dados antes de criar um look.' })
      return true
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar à análise agora.' })
      return false
    } finally {
      setAnalyzingId(null)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    const selectedFile = form.file
    const data = new FormData()
    data.append('metadata', JSON.stringify({
      name: form.name,
      category: form.category,
      colors: [{ name: form.color, family: form.color }],
      formality: Number(form.formality),
      notes: form.notes || null
    }))
    if (form.file) data.append('file', form.file)
    try {
      const response = await fetch('/api/private/closet', { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível adicionar a peça.' })
        return
      }
      setItems((current) => [result.item, ...current])
      setForm(initialForm)
      setState({ status: 'success', message: selectedFile ? 'Peça adicionada. Analisando os atributos da foto…' : 'Peça adicionada ao seu closet.' })
      if (selectedFile) await analyzeItem(result.item.id, true)
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    }
  }

  function beginEdit(item) {
    setEditingId(item.id)
    setEditForm({ name: item.name || '', category: item.category || 'unknown', color: item.colors?.[0]?.family || item.colors?.[0]?.name || 'neutro', formality: item.formality || 3 })
  }

  async function saveEdit(event, id) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/closet/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          colors: [{ name: editForm.color, family: editForm.color }],
          formality: Number(editForm.formality)
        })
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível salvar a correção.' })
        return
      }
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...result.item } : item))
      setEditingId(null)
      setState({ status: 'success', message: 'Dados da peça atualizados.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    }
  }

  async function archive(id) {
    setArchivingId(id)
    try {
      const response = await fetch('/api/private/closet/' + id, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível arquivar essa peça.' })
        return
      }
      setItems((current) => current.filter((item) => item.id !== id))
      setState({ status: 'success', message: 'Peça arquivada.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    } finally {
      setArchivingId(null)
    }
  }

  async function updateAvailability(id, availability) {
    setAvailabilityId(id)
    try {
      const response = await fetch('/api/private/closet/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability })
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível atualizar a situação da peça.' })
        return
      }
      setItems((current) => current.map((item) => item.id === id ? { ...item, availability: result.item?.availability || availability } : item))
      setState({ status: 'success', message: 'Situação da peça atualizada.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    } finally {
      setAvailabilityId(null)
    }
  }

  return (
    <div className={'closet-layout' + (addOnly ? ' closet-layout-add-only' : '')}>
      <form noValidate className="closet-add-card" onSubmit={submit}>
        <div className="app-section-label"><span>01</span><span>Adicionar peça</span></div>
        <h2>Comece pelo que<br />{' '}<em>já é seu.</em></h2>
        <p>Uma foto ajuda o Roupzy a organizar. Você sempre confirma os detalhes antes de usar uma sugestão.</p>
        <label><span>Nome da peça</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: camisa de linho" /></label>
        <label><span>Categoria</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Família de cor</span><input required value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} placeholder="Ex.: azul-marinho" /></label>
        <label><span>Formalidade: {form.formality}/5</span><input type="range" min="1" max="5" value={form.formality} onChange={(event) => setForm({ ...form, formality: event.target.value })} /></label>
        <label><span>Foto da peça</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} /></label>
        <button className="app-primary-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Guardando…' : 'Adicionar ao closet'} <span>↗</span></button>
        {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
      </form>
      {!addOnly ? <section className="closet-list" aria-labelledby="closet-list-title">
        <div className="app-section-label"><span>02</span><span id="closet-list-title">Arquivo de peças</span><span className="app-count">{items.length + ' registradas'}</span></div>
        <div className="closet-list-tools" aria-label="Filtros do closet">
          <label><span>Buscar no arquivo</span><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nome, cor ou categoria" /></label>
          <label><span>Categoria</span><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="all">Todas</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>Análise</span><select value={filters.analysis} onChange={(event) => setFilters({ ...filters, analysis: event.target.value })}>{analysisFilters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>Situação</span><select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value })}>{availabilityFilters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        <div className="closet-grid">
          {visibleItems.map((item) => (
            <article className="closet-item" key={item.id}>
              <div className="closet-item-visual">
                {item.assetUrl ? <img src={item.assetUrl} alt="" /> : <span className="closet-item-shape" aria-hidden="true" />}
                <button type="button" className="closet-item-remove" onClick={() => archive(item.id)} disabled={archivingId === item.id} aria-label={'Arquivar ' + item.name}>{archivingId === item.id ? '…' : '×'}</button>
              </div>
              <div className="closet-item-meta">
                <span>{clothingCategoryLabel(item.category)}</span>
                <Link className="closet-item-name" href={'/app/closet/' + item.id}><strong>{item.name}</strong></Link>
                <small>{item.colors?.[0]?.name || 'cor a confirmar'} · {item.analysis_status === 'ready' ? 'análise confirmada' : item.asset_id ? 'aguarda análise' : 'cadastro manual'} · {availabilityLabels[item.availability || 'active']}</small>
                <div className="closet-item-actions">
                  {item.asset_id && item.analysis_status !== 'ready' ? <button type="button" className="closet-item-action" onClick={() => analyzeItem(item.id)} disabled={analyzingId === item.id}>{analyzingId === item.id ? 'Analisando…' : 'Analisar com IA'}</button> : null}
                  <button type="button" className="closet-item-action" onClick={() => editingId === item.id ? setEditingId(null) : beginEdit(item)}>{editingId === item.id ? 'Fechar edição' : 'Corrigir dados'}</button>
                  <label className="closet-item-availability"><span className="sr-only">Situação de {item.name}</span><select value={item.availability || 'active'} onChange={(event) => updateAvailability(item.id, event.target.value)} disabled={availabilityId === item.id}><option value="active">Disponível</option><option value="laundry">Na lavanderia</option><option value="repair">Em conserto</option></select></label>
                </div>
                {editingId === item.id ? <form noValidate className="closet-item-edit" onSubmit={(event) => saveEdit(event, item.id)}>
                  <label><span>Nome</span><input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label>
                  <label><span>Categoria</span><select value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>Cor</span><input required value={editForm.color} onChange={(event) => setEditForm({ ...editForm, color: event.target.value })} /></label>
                  <label><span>Formalidade: {editForm.formality}/5</span><input type="range" min="1" max="5" value={editForm.formality} onChange={(event) => setEditForm({ ...editForm, formality: event.target.value })} /></label>
                  <button className="app-primary-button" type="submit" disabled={state.status === 'loading'}>Salvar correção <span>↗</span></button>
                </form> : null}
              </div>
            </article>
          ))}
          {!visibleItems.length ? <div className="app-empty"><span className="app-empty-mark">{items.length ? '⌕' : <BrandMark className="brand-mark" size={44} />}</span><strong>{items.length ? 'Nenhuma peça corresponde aos filtros.' : 'Seu arquivo começa aqui.'}</strong><p>{items.length ? 'Ajuste a busca, a categoria ou o estado da análise para encontrar uma peça.' : 'Adicione sua primeira peça para montar combinações a partir do que você já tem.'}</p></div> : null}
        </div>
      </section> : <section className="closet-add-next-panel"><span className="dashboard-panel-kicker">DEPOIS DO CADASTRO</span><h2>Seu arquivo fica<br />{' '}<em>mais inteligente.</em></h2><p>Você poderá revisar os atributos, filtrar suas peças e usar tudo nas próximas combinações.</p><Link className="app-outline-button" href="/app/closet">Abrir meu closet <span aria-hidden="true">↗</span></Link></section>}
    </div>
  )
}
