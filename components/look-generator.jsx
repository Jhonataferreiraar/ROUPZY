'use client'

import { useState } from 'react'

import { clothingCategoryLabel } from '@/lib/ui/labels'

const occasions = ['Trabalho', 'Fim de semana', 'Jantar', 'Evento']
const vibes = ['Leve', 'Presente', 'Refinado', 'Criativo']

export function LookGenerator() {
  const [request, setRequest] = useState({ occasion: 'Trabalho', vibe: 'Presente', weatherC: '' })
  const [outfits, setOutfits] = useState([])
  const [feedbackKinds, setFeedbackKinds] = useState({})
  const [usedIds, setUsedIds] = useState([])
  const [actionId, setActionId] = useState(null)
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function generate(event) {
    event?.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, weatherC: request.weatherC === '' ? null : Number(request.weatherC) })
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível gerar agora.' })
        return
      }
      setOutfits(result.outfits || [])
      setFeedbackKinds({})
      setUsedIds([])
      setState({ status: 'success', message: 'Sugestões criadas a partir do seu arquivo.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    }
  }

  async function reactTo(id, kind) {
    setActionId(id + ':' + kind)
    try {
      const response = await fetch('/api/private/looks/' + id + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind })
      })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível registrar sua escolha.' })
        return
      }
      setFeedbackKinds((current) => ({ ...current, [id]: kind }))
      setState({ status: 'success', message: kind === 'rejected' ? 'Look rejeitado. Vamos levar isso em conta.' : kind === 'favorited' ? 'Look guardado nos favoritos.' : 'Sua preferência foi registrada.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    } finally {
      setActionId(null)
    }
  }

  async function toggleFavorite(id) {
    if (feedbackKinds[id] !== 'favorited') {
      await reactTo(id, 'favorited')
      return
    }
    setActionId(id + ':unfavorite')
    try {
      const response = await fetch('/api/private/looks/' + id + '/feedback', { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível remover dos favoritos.' })
        return
      }
      setFeedbackKinds((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      setState({ status: 'success', message: 'Look removido dos favoritos.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    } finally {
      setActionId(null)
    }
  }

  async function markUsed(id) {
    setActionId(id + ':used')
    try {
      const response = await fetch('/api/private/looks/' + id + '/used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const result = await response.json()
      if (response.ok) setUsedIds((current) => current.includes(id) ? current : [...current, id])
      setState(response.ok ? { status: 'success', message: 'Look marcado como usado hoje.' } : { status: 'error', message: result.error || 'Não foi possível salvar no histórico.' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    } finally {
      setActionId(null)
    }
  }

  function cardBusy(id) {
    return Boolean(actionId?.startsWith(id + ':'))
  }

  return (
    <div className="looks-workspace">
      <form noValidate className="look-request-card" onSubmit={generate}>
        <div className="app-section-label"><span>01</span><span>Direção de hoje</span></div>
        <h2>O que o momento<br />{' '}<em>pede?</em></h2>
        <p>O motor cruza ocasião, vibe, cor e formalidade para encontrar combinações no seu próprio closet.</p>
        <fieldset><legend>Ocasião</legend><div className="app-choice-grid">{occasions.map((option) => <button type="button" key={option} className={request.occasion === option ? 'is-selected' : ''} aria-pressed={request.occasion === option} onClick={() => setRequest({ ...request, occasion: option })}>{option}</button>)}</div></fieldset>
        <fieldset><legend>Vibe</legend><div className="app-choice-grid">{vibes.map((option) => <button type="button" key={option} className={request.vibe === option ? 'is-selected' : ''} aria-pressed={request.vibe === option} onClick={() => setRequest({ ...request, vibe: option })}>{option}</button>)}</div></fieldset>
        <label className="look-weather-field"><span>Temperatura aproximada <small>opcional</small></span><div><input name="weatherC" aria-label="Temperatura aproximada em graus Celsius" type="number" min="-50" max="70" step="1" value={request.weatherC} onChange={(event) => setRequest({ ...request, weatherC: event.target.value })} placeholder="Ex.: 24" /><b>°C</b></div></label>
        <button className="app-primary-button" type="submit" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Lendo seu arquivo…' : 'Encontrar meus looks'} <span>↗</span></button>
        {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
      </form>
      <section className="looks-results" aria-labelledby="looks-results-title">
        <div className="app-section-label"><span>02</span><span id="looks-results-title">Sugestões do Roupzy</span><span className="app-count">{outfits.length ? outfits.length + ' combinações' : 'ainda sem geração'}</span></div>
        <div className="look-result-grid">
          {outfits.map((outfit, index) => (
            <article className="look-card" key={outfit.id}>
              <div className="look-card-head"><span>LOOK 0{index + 1}</span><strong>{outfit.occasion}</strong></div>
              <div className="look-pieces">{outfit.items?.map((item) => <div className="look-piece" key={item.id}><span className={'look-piece-' + item.category} aria-hidden="true" /><div><small>{clothingCategoryLabel(item.category)}</small><strong>{item.name}</strong></div></div>)}</div>
              <p>{outfit.explanation}</p>
              <div className="look-card-actions"><button type="button" className={feedbackKinds[outfit.id] === 'liked' ? 'is-active' : ''} aria-pressed={feedbackKinds[outfit.id] === 'liked'} onClick={() => reactTo(outfit.id, 'liked')} disabled={cardBusy(outfit.id)}>Gostei</button><button type="button" className={feedbackKinds[outfit.id] === 'rejected' ? 'is-active' : ''} aria-pressed={feedbackKinds[outfit.id] === 'rejected'} onClick={() => reactTo(outfit.id, 'rejected')} disabled={cardBusy(outfit.id)}>Rejeitar</button><button type="button" className={feedbackKinds[outfit.id] === 'favorited' ? 'is-active' : ''} aria-pressed={feedbackKinds[outfit.id] === 'favorited'} onClick={() => toggleFavorite(outfit.id)} disabled={cardBusy(outfit.id)}>{feedbackKinds[outfit.id] === 'favorited' ? 'Remover favorito' : 'Favoritar'}</button><button type="button" onClick={() => markUsed(outfit.id)} disabled={cardBusy(outfit.id) || usedIds.includes(outfit.id)}>{usedIds.includes(outfit.id) ? 'Usado hoje' : 'Usei hoje'}</button></div>
            </article>
          ))}
          {!outfits.length ? <div className="app-empty"><span className="app-empty-mark">↗</span><strong>Três caminhos, quando você quiser.</strong><p>Escolha um momento e o Roupzy combina as peças disponíveis do seu closet.</p></div> : null}
        </div>
      </section>
    </div>
  )
}
