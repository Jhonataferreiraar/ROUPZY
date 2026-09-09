'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AccountDangerZone() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation })
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível excluir a conta agora.' })
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    }
  }

  return (
    <section className="danger-zone">
      <div><span className="app-section-label">Encerrar conta</span><h2>Apagar meu espaço</h2><p>Essa ação remove sua conta, peças, imagens, looks, preferências e histórico. Depois da confirmação, não será possível desfazer.</p></div>
      <form noValidate onSubmit={submit}><label><span>Digite EXCLUIR para confirmar</span><input required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><button type="submit" disabled={state.status === 'loading' || confirmation !== 'EXCLUIR'}>{state.status === 'loading' ? 'Excluindo…' : 'Excluir minha conta'}</button>{state.message ? <p className="app-feedback app-feedback-error" role="alert">{state.message}</p> : null}</form>
    </section>
  )
}
