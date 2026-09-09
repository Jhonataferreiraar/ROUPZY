/* Signed Supabase URLs are private and dynamic, so they cannot use a static Next image host. */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'

import { matchTypeLabel } from '@/lib/ui/labels'

function statusCopy(status) {
  return status === 'ready' ? 'Análise pronta' : status === 'failed' ? 'Análise falhou' : 'Aguardando análise'
}

export function InspirationManager() {
  const inputRef = useRef(null)
  const [inspirations, setInspirations] = useState([])
  const [state, setState] = useState({ status: 'loading', message: '' })
  const [busy, setBusy] = useState('')

  async function load() {
    try {
      const response = await fetch('/api/private/inspirations', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar suas referências.')
      setInspirations(result.inspirations || [])
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar suas referências.' })
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function analyze(id) {
    setBusy(id + ':analyze')
    try {
      const response = await fetch('/api/private/inspirations/' + id + '/analyze', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível analisar a referência.')
      setInspirations((current) => current.map((item) => item.id === id ? { ...item, analysis_status: 'ready', attributes: result.attributes, analysis_version: result.analysisVersion } : item))
      return true
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível analisar a referência.' })
      return false
    } finally {
      setBusy('')
    }
  }

  async function match(id) {
    setBusy(id + ':match')
    try {
      const response = await fetch('/api/private/inspirations/' + id + '/matches', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível encontrar peças parecidas.')
      setInspirations((current) => current.map((item) => item.id === id ? { ...item, inspiration_matches: (result.matches || []).map((match) => ({ ...match, clothing_items: item.inspiration_matches?.find((old) => old.clothing_item_id === match.clothingItemId)?.clothing_items || { id: match.clothingItemId, name: 'Peça do seu closet' } })) } : item))
      setState({ status: 'success', message: 'Referência cruzada com seu closet.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível encontrar peças parecidas.' })
    } finally {
      setBusy('')
    }
  }

  async function remove(id) {
    if (!window.confirm('Excluir esta referência e suas correspondências?')) return
    setBusy(id + ':remove')
    try {
      const response = await fetch('/api/private/inspirations/' + id, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível excluir a referência.')
      setInspirations((current) => current.filter((item) => item.id !== id))
      setState({ status: 'success', message: 'Referência excluída.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível excluir a referência.' })
    } finally {
      setBusy('')
    }
  }

  async function submit(event) {
    event.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) {
      setState({ status: 'error', message: 'Escolha uma imagem de referência.' })
      return
    }
    setBusy('upload')
    setState({ status: 'loading', message: '' })
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/private/inspirations', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível guardar a referência.')
      const created = result.inspiration
      setInspirations((current) => [created, ...current])
      if (inputRef.current) inputRef.current.value = ''
      const analyzed = await analyze(created.id)
      if (analyzed) await match(created.id)
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível guardar a referência.' })
    } finally {
      setBusy('')
    }
  }

  return <div className="inspiration-manager"><form noValidate className="inspiration-upload" onSubmit={submit}><div><span className="app-kicker">NOVA REFERÊNCIA</span><h2>Traga uma ideia para perto.</h2><p>Envie uma foto de look, vitrine ou produção. O Roupzy encontra caminhos usando somente o que já está no seu closet.</p></div><div className="inspiration-upload-action"><label><span>Imagem JPG, PNG ou WebP</span><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" /></label><button className="app-primary-button" type="submit" disabled={Boolean(busy)}>{busy === 'upload' ? 'Enviando…' : 'Analisar referência'} <span>↗</span></button></div></form>{state.message ? <p className={'app-feedback app-feedback-' + (state.status === 'success' ? 'success' : 'error')} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}<section className="inspiration-list"><div className="app-section-label"><span>REFERÊNCIAS SALVAS</span><span>{inspirations.length} no seu espaço</span></div>{inspirations.length ? inspirations.map((inspiration) => { const cardBusy = Boolean(busy?.startsWith(inspiration.id + ':')); return <article className="inspiration-card" key={inspiration.id}><div className="inspiration-card-image">{inspiration.assetUrl ? <img src={inspiration.assetUrl} alt="Referência de estilo salva" /> : <span aria-hidden="true">R</span>}</div><div className="inspiration-card-content"><div className="inspiration-card-head"><div><span className="app-kicker">{statusCopy(inspiration.analysis_status)}</span><h2>{inspiration.attributes?.silhouette || 'Referência do seu repertório'}</h2></div><time>{new Date(inspiration.created_at).toLocaleDateString('pt-BR')}</time></div>{inspiration.attributes?.colors?.length ? <div className="inspiration-tags">{inspiration.attributes.colors.map((color) => <span key={color}>{color}</span>)}{inspiration.attributes.occasion ? <span>{inspiration.attributes.occasion}</span> : null}</div> : <p className="inspiration-muted">A análise identifica cores, silhueta, camadas e ocasião.</p>}{inspiration.analysis_status === 'ready' ? <div className="inspiration-matches"><div className="app-section-label"><span>PEÇAS DO SEU CLOSET</span><span>{inspiration.inspiration_matches?.length || 0} caminhos</span></div>{inspiration.inspiration_matches?.length ? inspiration.inspiration_matches.map((match) => <div className="inspiration-match" key={match.id || match.clothingItemId}><strong>{match.clothing_items?.name || 'Peça do seu closet'}</strong><span>{matchTypeLabel(match.match_type || match.matchType)} · {Math.round((match.score || 0) * 100)}%</span></div>) : <p className="inspiration-muted">Ainda não cruzamos esta referência com suas peças.</p>}</div> : null}<div className="inspiration-card-actions">{inspiration.analysis_status !== 'ready' ? <button type="button" onClick={() => analyze(inspiration.id)} disabled={cardBusy}>{cardBusy ? 'Analisando…' : 'Analisar'}</button> : <button type="button" onClick={() => match(inspiration.id)} disabled={cardBusy}>{cardBusy ? 'Cruzando…' : 'Cruzar com closet'}</button>}<button type="button" className="inspiration-delete-button" onClick={() => remove(inspiration.id)} disabled={cardBusy}>{busy === inspiration.id + ':remove' ? 'Excluindo…' : 'Excluir'}</button></div></div></article> }) : state.status === 'loading' ? <p className="inspiration-muted">Carregando referências…</p> : <div className="inspiration-empty"><span>01</span><h2>Seu repertório começa aqui.</h2><p>Salve uma referência para transformar inspiração em possibilidades reais.</p></div>}</section></div>
}
