'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SignOutButton } from '@/components/sign-out-button'
import { adminRoleLabel } from '@/lib/ui/labels'

const sections = [
  { href: '/admin', label: 'Visão geral', icon: '⌂', exact: true },
  { href: '/admin/relatorios', label: 'Relatórios', icon: '▥' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '◉' },
  { href: '/admin/produto', label: 'Produto e planos', icon: '◆' },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: '▦' },
  { href: '/admin/moderacao', label: 'Moderação', icon: '◌' },
  { href: '/admin/inteligencia-artificial', label: 'Inteligência artificial', icon: '✦' },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: '▤' },
  { href: '/admin/suporte', label: 'Suporte', icon: '✉' },
  { href: '/admin/auditoria', label: 'Auditoria', icon: '≡' },
  { href: '/admin/integracoes', label: 'Integrações', icon: '⌘' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙' }
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

  return <main className="admin-global-site admin-dashboard-app">
    <aside className="admin-dashboard-sidebar">
      <div className="admin-sidebar-top">
        <Link className="admin-dashboard-brand" href="/admin" aria-label="Painel administrativo Roupzy"><span>R</span><strong>ROUPZY</strong></Link>
        <span className="admin-sidebar-mode">CENTRO DE COMANDO</span>
      </div>
      <div className="admin-sidebar-workspace"><i /><div><strong>Operação Roupzy</strong><small>Ambiente produtivo</small></div><span>↗</span></div>
      <nav className="admin-dashboard-nav" aria-label="Navegação do painel">
        {navigationGroups.map((group) => <div className="admin-nav-group" key={group.label}><span className="admin-sidebar-caption">{group.label}</span>{group.items.map((section) => <Link className={(section.exact ? pathname === section.href : pathname.startsWith(section.href)) ? 'is-active' : ''} href={section.href} key={section.href}><span>{section.icon}</span><b>{section.label}</b><i aria-hidden="true">↗</i></Link>)}</div>)}
      </nav>
      <div className="admin-sidebar-external"><span className="admin-sidebar-caption">Acessos rápidos</span><Link href="/app">Área do cliente <span aria-hidden="true">↗</span></Link><Link href="/">Site público <span aria-hidden="true">↗</span></Link></div>
      <div className="admin-sidebar-spacer" />
      <div className="admin-sidebar-account"><span className="admin-account-avatar">{(email || 'R').slice(0, 1).toUpperCase()}</span><div><strong>{adminRoleLabel(role)}</strong><small>{email || 'conta proprietária'}</small></div></div>
      <div className="admin-sidebar-isolation"><i /> Ambiente administrativo isolado</div>
    </aside>
    <div className="admin-dashboard-body">
      <header className="admin-dashboard-topbar"><div className="admin-topbar-context"><span className="admin-topbar-kicker">Centro de comando / Roupzy</span><div className="admin-topbar-breadcrumb"><strong>{currentLabel}</strong><span>Visão protegida do produto</span></div></div><div className="admin-topbar-actions"><div className="admin-topbar-links"><Link href="/app">Área do cliente</Link><Link href="/">Site público</Link></div><span className="admin-environment"><i /> Dados protegidos</span><SignOutButton redirectTo="/admin/login" className="admin-topbar-signout" /></div></header>
      <div className="admin-dashboard-content shell">{children}</div>
    </div>
  </main>
}
