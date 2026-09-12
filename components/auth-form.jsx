'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { PasswordField } from '@/components/password-field'

export function AuthForm({ mode = 'login', endpoint, redirectTo = '/app', submitLabel, allowSocial = true }) {
  const isSignup = mode === 'signup'
  const router = useRouter()
  const [form, setForm] = useState({ displayName: '', email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    const requestEndpoint = endpoint || (isSignup ? '/api/auth/sign-up' : '/api/auth/sign-in')
    const payload = isSignup
      ? form
      : { email: form.email, password: form.password }
    try {
      const response = await fetch(requestEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível concluir agora.' })
        return
      }
      if (isSignup && result.needsEmailConfirmation) {
        router.replace('/verifique-email?email=' + encodeURIComponent(form.email))
        return
      }
      router.replace(redirectTo)
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora. Tente novamente.' })
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {isSignup ? (
        <label>
          <span>Como podemos te chamar?</span>
          <input
            autoComplete="name"
            required
            value={form.displayName}
            onChange={(event) => update('displayName', event.target.value)}
            placeholder="Seu nome"
          />
        </label>
      ) : null}
      <label>
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          placeholder="voce@email.com"
        />
      </label>
      <PasswordField label="Senha" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={8} value={form.password} onChange={(value) => update('password', value)} placeholder="Mínimo de 8 caracteres" />
      <button className="auth-submit" type="submit" disabled={state.status === 'loading'} aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? 'Aguarde…' : submitLabel || (isSignup ? 'Criar meu espaço' : 'Entrar no meu espaço')}
        <span className="ri-arrow" aria-hidden="true" />
      </button>
      {state.message ? (
        <p className={'auth-feedback auth-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>
          {state.message}
        </p>
      ) : null}
      {allowSocial ? <><div className="auth-divider"><span>ou continue com</span></div><div className="auth-social-grid">
        <a href={`/api/auth/oauth?provider=google&next=${encodeURIComponent(redirectTo)}`}><span aria-hidden="true">G</span>Google</a>
        <a href={`/api/auth/oauth?provider=apple&next=${encodeURIComponent(redirectTo)}`}><span aria-hidden="true">●</span>Apple</a>
      </div></> : null}
    </form>
  )
}
