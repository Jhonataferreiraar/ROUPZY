'use client'

import { useState } from 'react'

export function ProfileForm({ profile, preferences }) {
  const [form, setForm] = useState({
    displayName: profile?.display_name || '',
    defaultVibe: preferences?.default_vibe || '',
    preferredFormality: preferences?.preferred_formality || 3,
    avoidedColors: Array.isArray(preferences?.avoided_colors) ? preferences.avoided_colors.join(', ') : ''
  })
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function save(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName,
          defaultVibe: form.defaultVibe || null,
          preferredFormality: Number(form.preferredFormality),
          avoidedColors: form.avoidedColors.split(',').map((item) => item.trim()).filter(Boolean)
        })
      })
      const result = await response.json()
      setState(response.ok ? { status: 'success', message: 'Preferências salvas.' } : { status: 'error', message: result.error || 'Não foi possível salvar.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora. Tente novamente.' })
    }
  }

  return (
    <form noValidate className="profile-form" onSubmit={save}>
      <label><span>Seu nome</span><input required value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label>
      <label><span>Vibe que mais combina com você</span><input value={form.defaultVibe} onChange={(event) => setForm({ ...form, defaultVibe: event.target.value })} placeholder="Ex.: leve e presente" /></label>
      <label><span>Formalidade preferida: {form.preferredFormality}/5</span><input type="range" min="1" max="5" value={form.preferredFormality} onChange={(event) => setForm({ ...form, preferredFormality: event.target.value })} /></label>
      <label><span>Cores que você evita</span><input value={form.avoidedColors} onChange={(event) => setForm({ ...form, avoidedColors: event.target.value })} placeholder="Separe por vírgulas" /></label>
      <button className="app-primary-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Salvando…' : 'Salvar preferências'} <span>↗</span></button>
      {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    </form>
  )
}
