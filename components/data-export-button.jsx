'use client'

import { useState } from 'react'

export function DataExportButton() {
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function exportData() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/account', { cache: 'no-store' })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Não foi possível preparar seus dados.')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'roupzy-meus-dados.json'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setState({ status: 'success', message: 'Seus dados foram baixados.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível preparar seus dados.' })
    }
  }

  return <div className="data-export-control"><div><strong>Baixar meus dados</strong><small>Receba um arquivo JSON com o conteúdo da sua conta.</small></div><button type="button" onClick={exportData} disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Preparando…' : 'Baixar arquivo ↗'}</button>{state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}</div>
}
