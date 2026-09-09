'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LookActions({ outfitId, initialFeedback = null, initialUsed = false, compact = false }) {
  const router = useRouter()
  const [feedback, setFeedback] = useState(initialFeedback)
  const [used, setUsed] = useState(initialUsed)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState({ status: '', message: '' })

  async function sendFeedback(kind) {
    setBusy(kind)
    setNotice({ status: '', message: '' })
    try {
      const response = await fetch('/api/private/looks/' + outfitId + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível registrar sua escolha.')
      setFeedback(kind)
      setNotice({ status: 'success', message: kind === 'rejected' ? 'Look rejeitado.' : kind === 'favorited' ? 'Look guardado nos favoritos.' : 'Preferência registrada.' })
      if (kind === 'favorited') router.refresh()
    } catch (error) {
      setNotice({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível registrar sua escolha.' })
    } finally {
      setBusy('')
    }
  }

  async function toggleFavorite() {
    if (feedback !== 'favorited') {
      await sendFeedback('favorited')
      return
    }
    setBusy('unfavorite')
    setNotice({ status: '', message: '' })
    try {
      const response = await fetch('/api/private/looks/' + outfitId + '/feedback', { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível remover este favorito.')
      setFeedback(null)
      setNotice({ status: 'success', message: 'Look removido dos favoritos.' })
      router.refresh()
    } catch (error) {
      setNotice({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível remover este favorito.' })
    } finally {
      setBusy('')
    }
  }

  async function markUsed() {
    setBusy('used')
    setNotice({ status: '', message: '' })
    try {
      const response = await fetch('/api/private/looks/' + outfitId + '/used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar no seu histórico.')
      setUsed(true)
      setNotice({ status: 'success', message: result.reused ? 'Este look já estava no histórico de hoje.' : 'Look marcado como usado hoje.' })
      router.refresh()
    } catch (error) {
      setNotice({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar no seu histórico.' })
    } finally {
      setBusy('')
    }
  }

  return <div className={'look-actions' + (compact ? ' look-actions-compact' : '')}>
    <button type="button" className={feedback === 'liked' ? 'is-active' : ''} aria-pressed={feedback === 'liked'} onClick={() => sendFeedback('liked')} disabled={Boolean(busy)}>Gostei</button>
    <button type="button" className={feedback === 'rejected' ? 'is-active' : ''} aria-pressed={feedback === 'rejected'} onClick={() => sendFeedback('rejected')} disabled={Boolean(busy)}>Rejeitar</button>
    <button type="button" className={feedback === 'favorited' ? 'is-active' : ''} aria-pressed={feedback === 'favorited'} onClick={toggleFavorite} disabled={Boolean(busy)}>{feedback === 'favorited' ? 'Remover favorito' : 'Favoritar'}</button>
    <button type="button" onClick={markUsed} disabled={Boolean(busy) || used}>{used ? 'Usado hoje' : 'Usei hoje'}</button>
    {notice.message ? <p className={'app-feedback ' + (notice.status === 'error' ? 'app-feedback-error' : 'app-feedback-success')} role="status">{notice.message}</p> : null}
  </div>
}
