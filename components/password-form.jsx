'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { PasswordField } from '@/components/password-field'

export function PasswordForm({ mode = 'forgot' }) {
  const isReset = mode === 'reset'
  const router = useRouter()
  const [value, setValue] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    const endpoint = isReset ? '/api/auth/reset-password' : '/api/auth/forgot-password'
    const payload = isReset ? { password: value } : { email: value }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível concluir agora.' })
        return
      }
      setState({
        status: 'success',
        message: isReset ? 'Senha atualizada. Você já pode entrar no seu espaço.' : 'Se o e-mail estiver cadastrado, o link de acesso chegará em instantes.'
      })
      if (isReset) window.setTimeout(() => router.replace('/login'), 1200)
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora. Tente novamente.' })
    }
  }

  return (
    <form noValidate className="auth-form" onSubmit={submit}>
      {isReset ? <PasswordField label="Nova senha" autoComplete="new-password" minLength={8} value={value} onChange={setValue} placeholder="Mínimo de 8 caracteres" /> : <label><span>E-mail de cadastro</span><input type="email" autoComplete="email" required value={value} onChange={(event) => setValue(event.target.value)} placeholder="voce@email.com" /></label>}
      <button className="auth-submit" type="submit" disabled={state.status === 'loading'} aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? 'Aguarde…' : isReset ? 'Salvar nova senha' : 'Enviar link seguro'}
        <span aria-hidden="true">↗</span>
      </button>
      {state.message ? (
        <p className={'auth-feedback auth-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
