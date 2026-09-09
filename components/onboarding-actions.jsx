'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function OnboardingActions() {
  const router = useRouter()
  const [state, setState] = useState('idle')

  async function finishLater() {
    setState('loading')
    try {
      const response = await fetch('/api/private/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingStatus: 'completed' })
      })
      if (!response.ok) {
        setState('error')
        return
      }
      router.replace('/app')
      router.refresh()
    } catch {
      setState('error')
    }
  }

  return <div className="onboarding-actions"><Link className="app-primary-button" href="/app/closet">Adicionar minhas peças <span>↗</span></Link><button type="button" onClick={finishLater} disabled={state === 'loading'}>{state === 'loading' ? 'Salvando…' : 'Fazer isso depois'}</button>{state === 'error' ? <p className="app-feedback app-feedback-error" role="alert">Não foi possível salvar agora.</p> : null}</div>
}
