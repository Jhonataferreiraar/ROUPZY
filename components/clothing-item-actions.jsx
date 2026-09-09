'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export function ClothingItemActions({ item }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: item.name || '',
    category: item.category || 'unknown',
    color: item.colors?.[0]?.family || item.colors?.[0]?.name || 'neutro',
    formality: item.formality || 3,
    availability: item.availability || 'active',
    notes: item.notes || ''
  })
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function save(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/closet/' + item.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          colors: [{ name: form.color, family: form.color }],
          formality: Number(form.formality),
          availability: form.availability,
          notes: form.notes || null
        })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar os dados da peça.')
      setState({ status: 'success', message: 'Dados da peça atualizados.' })
      setOpen(false)
      router.refresh()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar os dados da peça.' })
    }
  }

  async function archive() {
    if (!window.confirm('Arquivar esta peça? Ela deixará de aparecer nas combinações.')) return
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/closet/' + item.id, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível arquivar esta peça.')
      router.replace('/app/closet')
      router.refresh()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível arquivar esta peça.' })
    }
  }

  return <div className="clothing-item-actions">
    <div className="clothing-item-action-row"><button className="app-primary-button" type="button" onClick={() => setOpen((current) => !current)}>{open ? 'Fechar edição' : 'Editar peça'} <span aria-hidden="true">{open ? '×' : '↗'}</span></button><button className="clothing-item-archive" type="button" onClick={archive} disabled={state.status === 'loading'}>Arquivar</button></div>
    {open ? <form noValidate className="clothing-item-edit-form" onSubmit={save}>
      <label><span>Nome</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label><span>Categoria</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label><span>Família de cor</span><input required value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
      <label><span>Formalidade: {form.formality}/5</span><input type="range" min="1" max="5" value={form.formality} onChange={(event) => setForm({ ...form, formality: event.target.value })} /></label>
      <label><span>Situação</span><select value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })}><option value="active">Disponível</option><option value="laundry">Na lavanderia</option><option value="repair">Em conserto</option></select></label>
      <label className="clothing-item-edit-wide"><span>Observações</span><textarea className="resize-none" rows="3" maxLength="1000" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
      <button className="app-outline-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Salvando…' : 'Salvar alterações'} <span aria-hidden="true">↗</span></button>
    </form> : null}
    {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
  </div>
}
