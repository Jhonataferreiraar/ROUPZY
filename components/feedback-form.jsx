'use client'

import { useState } from 'react'

const categories = [
  ['product', 'Produto'],
  ['look', 'Sugestão de look'],
  ['bug', 'Problema'],
  ['other', 'Outro assunto']
]

export function FeedbackForm() {
  const [form, setForm] = useState({ category: 'product', body: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível enviar seu feedback.' })
        return
      }
      setForm({ category: 'product', body: '' })
      setState({ status: 'success', message: 'Feedback recebido. Obrigado por ajudar a melhorar o Roupzy.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora. Tente novamente.' })
    }
  }

  return (
    <form noValidate className="feedback-form" onSubmit={submit}>
      <label>
        <span>Sobre o que você quer falar?</span>
        <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>
      <label>
        <span>Seu feedback</span>
        <textarea className="resize-none" required rows="5" maxLength="2000" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Conte o que funcionou, o que faltou ou o que você gostaria de ver." />
      </label>
      <button className="app-primary-button" type="submit" disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Enviando…' : 'Enviar feedback'} <span aria-hidden="true">↗</span>
      </button>
      {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    </form>
  )
}
