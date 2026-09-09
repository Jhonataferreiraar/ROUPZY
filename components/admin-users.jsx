'use client'

import { useEffect, useRef, useState } from 'react'

import { adminRoleLabel, adminStatusLabel } from '@/lib/ui/labels'

function usageLabel(value) {
  if (!value || value.limit === null) return 'sem uso registrado'
  return `${value.consumed}/${value.limit}`
}

function AdminUserRow({ currentUser, canManage, canManageRoles, busy, onBlock, onRoleSave }) {
  const [selectedRole, setSelectedRole] = useState(currentUser.adminRole || 'none')

  return <div className="admin-user-row"><div><strong>{currentUser.displayName}</strong><small>{currentUser.email}</small><small className="admin-user-meta">Cadastro {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')} · {currentUser.onboardingStatus === 'completed' ? 'cadastro inicial concluído' : 'cadastro inicial pendente'}</small></div><div className="admin-user-plan"><strong>{currentUser.plan?.name || 'Plano padrão'}</strong><small>{currentUser.plan ? adminStatusLabel(currentUser.plan.status) : 'sem assinatura ativa'}</small><span>Looks {usageLabel(currentUser.usage?.looks)} · IA {usageLabel(currentUser.usage?.analyses)}</span></div><div className="admin-user-status"><span className={currentUser.blockedAt ? 'is-blocked' : ''}>{currentUser.blockedAt ? 'Bloqueado' : 'Ativo'}</span><small>{currentUser.adminRole ? 'Administrador · ' + adminRoleLabel(currentUser.adminRole) : 'Cliente'}</small></div><div className="admin-user-actions">{canManageRoles ? <><select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} aria-label={'Função de ' + currentUser.email}><option value="none">Cliente</option><option value="support">Suporte</option><option value="manager">Gerente</option><option value="owner">Proprietário</option></select><button type="button" onClick={() => onRoleSave(currentUser, selectedRole === 'none' ? null : selectedRole)} disabled={busy}>{busy ? '…' : 'Salvar função'}</button></> : null}{canManage ? <button className="admin-user-block-button" type="button" onClick={() => onBlock(currentUser)} disabled={busy}>{currentUser.blockedAt ? 'Desbloquear' : 'Bloquear'}</button> : null}</div></div>
}

export function AdminUsers({ canManage = false, canManageRoles = false, initialData = null }) {
  const [users, setUsers] = useState(initialData?.users || [])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(initialData?.page || 1)
  const [hasMore, setHasMore] = useState(Boolean(initialData?.hasMore))
  const [state, setState] = useState({ status: initialData ? 'idle' : 'loading', message: '' })
  const [busyId, setBusyId] = useState('')
  const searchInputRef = useRef(null)

  async function loadUsers(term = '', nextPage = 1) {
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/users?search=' + encodeURIComponent(term) + '&page=' + nextPage, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) {
        setState({ status: 'error', message: result.error || 'Não foi possível carregar os usuários.' })
        return
      }
      setUsers(result.users || [])
      setPage(result.page || nextPage)
      setHasMore(Boolean(result.hasMore))
      setState({ status: 'idle', message: '' })
    } catch {
      setState({ status: 'error', message: 'Não foi possível conectar agora.' })
    }
  }

  useEffect(() => {
    if (initialData) return undefined
    const timer = window.setTimeout(() => loadUsers(), 0)
    return () => window.clearTimeout(timer)
  }, [initialData])

  async function updateUser(currentUser, payload) {
    setBusyId(currentUser.id)
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, ...payload }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar o acesso.')
      setUsers((current) => current.map((item) => item.id === currentUser.id ? { ...item, ...('blocked' in payload ? { blockedAt: result.blockedAt } : { adminRole: result.adminRole }) } : item))
      setState({ status: 'idle', message: 'Acesso atualizado e registrado na auditoria.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Não foi possível atualizar o acesso.' })
    } finally {
      setBusyId('')
    }
  }

  return <section className="admin-users-panel"><div className="app-section-label"><span>Contas</span><span>gestão de acesso</span></div><p className="admin-section-description">Consulte cada conta, acompanhe a ativação e controle os acessos da equipe.</p><form noValidate className="admin-user-search" onSubmit={(event) => { event.preventDefault(); loadUsers(search, 1) }}><div className="admin-search-control"><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuário" /><button type="button" className="admin-search-clear" onClick={() => { setSearch(''); window.requestAnimationFrame(() => searchInputRef.current?.focus()) }} aria-label="Limpar busca" disabled={!search}>×</button></div><button type="submit">Buscar</button></form>{state.message ? <p className={'admin-users-feedback admin-users-feedback-' + state.status} role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : null}<div className="admin-user-list">{users.length ? users.map((currentUser) => <AdminUserRow key={currentUser.id} currentUser={currentUser} canManage={canManage} canManageRoles={canManageRoles} busy={busyId === currentUser.id} onBlock={(user) => updateUser(user, { blocked: !user.blockedAt })} onRoleSave={(user, role) => updateUser(user, { role })} />) : state.status === 'loading' ? <p className="admin-muted">Carregando contas…</p> : <p className="admin-muted">Nenhuma conta encontrada nesta página.</p>}</div><div className="admin-user-pagination"><button type="button" onClick={() => loadUsers(search, page - 1)} disabled={page <= 1 || state.status === 'loading'}>← Anterior</button><span>Página {page}</span><button type="button" onClick={() => loadUsers(search, page + 1)} disabled={!hasMore || state.status === 'loading'}>Próxima →</button></div></section>
}
