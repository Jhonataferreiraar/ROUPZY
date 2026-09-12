'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SignOutButton } from '@/components/sign-out-button'
import { BrandMark } from '@/components/brand'
import { adminRoleLabel } from '@/lib/ui/labels'

const sections = [
  { href: '/admin', label: 'Visão geral', icon: 'overview', exact: true },
  { href: '/admin/relatorios', label: 'Relatórios', icon: 'reports' },
  { href: '/admin/usuarios', label: 'Usuários', icon: 'users' },
  { href: '/admin/produto', label: 'Produto e planos', icon: 'product' },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: 'subscriptions' },
  { href: '/admin/moderacao', label: 'Moderação', icon: 'moderation' },
  { href: '/admin/inteligencia-artificial', label: 'Inteligência artificial', icon: 'intelligence' },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: 'content' },
  { href: '/admin/suporte', label: 'Suporte', icon: 'support' },
  { href: '/admin/auditoria', label: 'Auditoria', icon: 'audit' },
  { href: '/admin/integracoes', label: 'Integrações', icon: 'integrations' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: 'settings' }
]

const navigationGroups = [
  { label: 'Visão do negócio', items: sections.slice(0, 2) },
  { label: 'Operação', items: sections.slice(2, 9) },
  { label: 'Governança', items: sections.slice(9) }
]

function pageLabel(pathname) {
  return sections.find((section) => section.exact ? pathname === section.href : pathname.startsWith(section.href))?.label || 'Painel de controle'
}

export function AdminDashboardShell({ role = 'owner', email = '', children }) {
  const pathname = usePathname()
  const currentLabel = pageLabel(pathname)

  return <main className="admin-global-site admin-dashboard-app ri-admin-shell">
    <a className="ri-skip-link" href="#admin-content">Pular para o conteúdo</a>
    <aside className="admin-dashboard-sidebar">
      <div className="admin-sidebar-top">
        <Link className="admin-dashboard-brand" href="/admin" aria-label="Painel administrativo Roupzy"><BrandMark className="admin-dashboard-mark" size={34} /><strong>ROUPZY</strong></Link>
        <span className="admin-sidebar-mode">CENTRO DE COMANDO</span>
      </div>
      <div className="admin-sidebar-workspace"><i /><div><strong>Operação Roupzy</strong><small>Ambiente produtivo</small></div><span className="ri-arrow" aria-hidden="true" /></div>
      <nav className="admin-dashboard-nav" aria-label="Navegação do painel">
        {navigationGroups.map((group) => <div className="admin-nav-group" key={group.label}><span className="admin-sidebar-caption">{group.label}</span>{group.items.map((section) => <Link className={(section.exact ? pathname === section.href : pathname.startsWith(section.href)) ? 'is-active' : ''} href={section.href} key={section.href}><span className={'admin-nav-icon admin-nav-icon-' + section.icon} aria-hidden="true" /><b>{section.label}</b><i className="ri-arrow" aria-hidden="true" /></Link>)}</div>)}
      </nav>
      <div className="admin-sidebar-external"><span className="admin-sidebar-caption">Acessos rápidos</span><Link href="/app">Área do cliente <i className="ri-arrow" aria-hidden="true" /></Link><Link href="/">Site público <i className="ri-arrow" aria-hidden="true" /></Link></div>
      <div className="admin-sidebar-spacer" />
      <div className="admin-sidebar-account">{email ? <span className="admin-account-avatar">{email.slice(0, 1).toUpperCase()}</span> : <BrandMark className="admin-account-avatar" size={34} />}<div><strong>{adminRoleLabel(role)}</strong><small>{email || 'conta proprietária'}</small></div></div>
      <div className="admin-sidebar-isolation"><i /> Ambiente administrativo isolado</div>
    </aside>
    <div className="admin-dashboard-body">
      <header className="admin-dashboard-topbar"><div className="admin-topbar-context"><span className="admin-topbar-kicker">Centro de comando / Roupzy</span><div className="admin-topbar-breadcrumb"><strong>{currentLabel}</strong><span>Visão protegida do produto</span></div></div><div className="admin-topbar-actions"><div className="admin-topbar-links"><Link href="/app">Área do cliente</Link><Link href="/">Site público</Link></div><span className="admin-environment"><i /> Dados protegidos</span><SignOutButton redirectTo="/admin/login" className="admin-topbar-signout" /></div></header>
      <div className="admin-dashboard-content shell" id="admin-content">{children}</div>
    </div>
  </main>
}
