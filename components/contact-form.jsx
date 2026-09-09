'use client'

import { useState } from 'react'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Dúvida', body: '', consent: false })
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await response.json()
      setState(response.ok ? { status: 'success', message: 'Mensagem recebida. A equipe retorna por este e-mail.' } : { status: 'error', message: result.error || 'Não foi possível enviar agora.' })
      if (response.ok) setForm({ name: '', email: '', subject: 'Dúvida', body: '', consent: false })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora. Tente novamente.' })
    }
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <form noValidate className="contact-form" onSubmit={submit}>
      <label><span>Seu nome</span><input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
      <label><span>E-mail</span><input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="voce@email.com" /></label>
      <label><span>Assunto</span><select value={form.subject} onChange={(event) => update('subject', event.target.value)}><option>Dúvida</option><option>Parceria</option><option>Imprensa</option><option>Feedback</option></select></label>
      <label><span>Mensagem</span><textarea className="resize-none" required rows="5" value={form.body} onChange={(event) => update('body', event.target.value)} /></label>
      <label className="contact-consent"><input type="checkbox" required checked={form.consent} onChange={(event) => update('consent', event.target.checked)} /><span>Concordo que o Roupzy use estes dados apenas para responder minha mensagem.</span></label>
      <button className="rz-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Enviando…' : 'Enviar mensagem'} <span aria-hidden="true">↗</span></button>
      {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    </form>
  )
}
