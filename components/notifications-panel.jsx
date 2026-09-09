'use client'

import { useState } from 'react'

function dateLabel(value) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

export function NotificationsPanel({ initialNotifications = [] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [state, setState] = useState({ status: 'idle', message: '' })
  const unread = notifications.filter((item) => !item.read_at).length

  async function markRead(id) {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível marcar a notificação como lida.')
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
      setState({ status: 'success', message: 'Notificação marcada como lida.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar a notificação.' })
    }
  }

  async function markAllRead() {
    if (!unread) return
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/private/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível marcar as notificações como lidas.')
      const readAt = new Date().toISOString()
      setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })))
      setState({ status: 'success', message: 'Todas as notificações foram marcadas como lidas.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar as notificações.' })
    }
  }

  return <section className="notifications-panel">
    <div className="notifications-toolbar"><div><span className="app-kicker">CENTRAL DE AVISOS</span><h2>{unread ? `${unread} ${unread === 1 ? 'aviso novo' : 'avisos novos'}` : 'Tudo em dia'}</h2></div><button className="app-outline-button" type="button" onClick={markAllRead} disabled={!unread || state.status === 'loading'}>Marcar tudo como lido <span aria-hidden="true">✓</span></button></div>
    {state.message ? <p className={'app-feedback app-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}
    {notifications.length ? <div className="notification-list">{notifications.map((item) => <article className={'notification-row' + (item.read_at ? '' : ' is-unread')} key={item.id}><span className="notification-mark" aria-hidden="true">{item.read_at ? '·' : '!'}</span><div><small>{item.kind || 'Roupzy'} · {dateLabel(item.created_at)}</small><strong>{item.title}</strong><p>{item.body}</p></div>{item.read_at ? <span className="notification-read-label">Lida</span> : <button type="button" onClick={() => markRead(item.id)} disabled={state.status === 'loading'}>Marcar como lida</button>}</article>)}</div> : <div className="app-empty"><span className="app-empty-mark">✓</span><strong>Você está em dia.</strong><p>Novidades importantes sobre seu espaço aparecerão aqui.</p></div>}
  </section>
}
