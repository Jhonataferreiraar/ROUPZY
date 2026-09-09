'use client'

import { useEffect, useState } from 'react'

import { AdminContentControl } from '@/components/admin-content-control'

export function AdminContentPanel({ canManage = false, initialData = null }) {
  const [setting, setSetting] = useState(() => (initialData?.settings || []).find((item) => item.key === 'public.site_content') || null)
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })
  const [busy, setBusy] = useState(false)

  async function load() {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/control?section=settings', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o conteúdo do site.')
      setSetting((result.settings || []).find((item) => item.key === 'public.site_content') || null)
      setState({ status: 'idle', message: '' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar o conteúdo do site.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  async function save(payload) {
    setBusy(true)
    try {
      const response = await fetch('/api/admin/control', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível publicar o conteúdo.')
      setState({ status: 'idle', message: 'Conteúdo publicado. A página pública já foi revalidada.' })
      await load()
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível publicar o conteúdo.' })
    } finally {
      setBusy(false)
    }
  }

  if (state.status === 'loading' && !setting) return <section className="admin-control-panel"><p className="admin-muted">Carregando conteúdo público…</p></section>

  return <section className="admin-control-panel"><div className="app-section-label"><span>Conteúdo institucional</span><span>{canManage ? 'edição publicada' : 'somente leitura'}</span></div><p className="admin-control-lead">Atualize a chamada principal da home e as perguntas frequentes sem editar código. Cada publicação é validada no servidor e fica registrada na auditoria.</p>{state.message ? <p className={'admin-users-feedback admin-users-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}<AdminContentControl setting={setting} canManage={canManage} busy={busy} onSave={save} /></section>
}
