import Link from 'next/link'

import { Brand } from '@/components/brand'
import { AppNavigation } from '@/components/app-navigation'
import { SignOutButton } from '@/components/sign-out-button'

export function AppShell({ children, profile }) {
  const name = profile?.display_name || 'seu espaço'
  const initial = name.charAt(0).toUpperCase()
  return (
    <main className="app-site ri-client-shell">
      <a className="ri-skip-link" href="#client-content">Pular para o conteúdo</a>
      <div className="app-workspace">
        <aside className="app-sidebar" aria-label="Painel pessoal">
          <div className="app-sidebar-top">
            <Link href="/app" aria-label="Roupzy, início do espaço pessoal"><Brand /></Link>
            <span className="app-product-label">ESPAÇO DO CLIENTE</span>
          </div>
          <AppNavigation />
          <div className="app-sidebar-bottom">
            <Link className="app-sidebar-add" href="/app/closet/adicionar"><span aria-hidden="true">+</span>Adicionar peça</Link>
            <Link className="app-sidebar-user" href="/app/perfil">
              <span className="app-avatar" aria-hidden="true">{initial}</span>
              <div><strong>{name}</strong><small>Conta pessoal</small></div>
            </Link>
            <SignOutButton />
          </div>
        </aside>
        <section className="app-workspace-main">
          <header className="app-topbar">
            <div className="app-topbar-context"><span>ESPAÇO DO CLIENTE / ROUPZY</span><strong>Central de estilo pessoal</strong></div>
            <div className="app-topbar-tools">
              <Link className="app-topbar-help" href="/faq">Ajuda</Link>
              <span className="app-session-status"><i aria-hidden="true" /> Conta protegida</span>
              <Link className="app-topbar-user" href="/app/perfil" aria-label={`Abrir perfil de ${name}`}>
                <span className="app-topbar-user-avatar" aria-hidden="true">{initial}</span>
                <span><strong>{name}</strong><small>Meu perfil</small></span>
              </Link>
              <Link className="app-topbar-action" href="/app/closet/adicionar"><span aria-hidden="true">+</span>Nova peça</Link>
              <AppNavigation mobileOnly />
            </div>
          </header>
          <div className="app-content" id="client-content">{children}</div>
        </section>
      </div>
    </main>
  )
}
