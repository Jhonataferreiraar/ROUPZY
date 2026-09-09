'use client'

import { useState } from 'react'

import { PasswordField } from '@/components/password-field'

export function PasswordChangeForm() {
  const [form, setForm] = useState({ password: '', confirmation: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    if (form.password !== form.confirmation) {
      setState({ status: 'error', message: 'As senhas precisam ser iguais.' })
      return
    }
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar sua senha.')
      setForm({ password: '', confirmation: '' })
      setState({ status: 'success', message: 'Senha atualizada com segurança.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar sua senha.' })
    }
  }

  return <form noValidate className="password-change-form" onSubmit={submit}>
    <PasswordField label="Nova senha" autoComplete="new-password" minLength={8} value={form.password} onChange={(value) => setForm({ ...form, password: value })} placeholder="Mínimo de 8 caracteres" />
    <PasswordField label="Confirmar nova senha" autoComplete="new-password" minLength={8} value={form.confirmation} onChange={(value) => setForm({ ...form, confirmation: value })} placeholder="Digite novamente" />
    <button className="app-outline-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Atualizando…' : 'Atualizar senha'} <span aria-hidden="true">↗</span></button>
    {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
  </form>
}
