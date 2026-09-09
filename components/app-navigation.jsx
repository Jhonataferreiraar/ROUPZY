'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const groups = [
  { label: 'Início', links: [['/app', 'Visão geral', true]] },
  { label: 'Organizar', links: [['/app/closet', 'Meu closet'], ['/app/looks', 'Looks'], ['/app/calendario', 'Calendário'], ['/app/capsulas', 'Cápsulas']] },
  { label: 'Descobrir', links: [['/app/inspiracao', 'Inspirações'], ['/app/compras', 'Compras inteligentes'], ['/app/favoritos', 'Favoritos']] },
  { label: 'Acompanhar', links: [['/app/estatisticas', 'Estatísticas'], ['/app/cuidados', 'Cuidados'], ['/app/sustentabilidade', 'Sustentabilidade']] },
  { label: 'Conta', links: [['/app/notificacoes', 'Notificações'], ['/app/perfil', 'Perfil'], ['/app/assinatura', 'Assinatura'], ['/app/configuracoes', 'Configurações']] }
]

const links = groups.flatMap((group) => group.links)

function isActive(pathname, href, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
}

export function AppNavigation({ mobileOnly = false }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div className={'app-navigation' + (mobileOnly ? ' app-navigation-mobile' : '')} key={pathname}>
      <nav className="app-nav" aria-label="Navegação do espaço pessoal">
        {groups.map((group) => <div className="app-nav-group" key={group.label}>
          <span className="app-nav-label">{group.label}</span>
          {group.links.map(([href, label, exact], index) => <Link className={isActive(pathname, href, exact) ? 'app-nav-link is-active' : 'app-nav-link'} href={href} aria-current={isActive(pathname, href, exact) ? 'page' : undefined} key={href}><span className="app-nav-index">{String(index + 1).padStart(2, '0')}</span><span>{label}</span><b aria-hidden="true">↗</b></Link>)}
        </div>)}
      </nav>
      <button className="app-mobile-toggle navigation-mobile-toggle" type="button" aria-expanded={open} aria-controls="app-mobile-menu" onClick={() => setOpen((current) => !current)}>
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        <i aria-hidden="true" />
      </button>
      {open ? <nav className="app-mobile-menu" id="app-mobile-menu" aria-label="Navegação móvel do espaço pessoal">
        <span className="app-mobile-menu-label">Seu espaço</span>
        {links.map(([href, label, exact], index) => <Link className={isActive(pathname, href, exact) ? 'is-active' : ''} href={href} aria-current={isActive(pathname, href, exact) ? 'page' : undefined} onClick={closeMenu} key={href}><span className="app-mobile-menu-index">{String(index + 1).padStart(2, '0')}</span>{label}<span aria-hidden="true">↗</span></Link>)}
      </nav> : null}
    </div>
  )
}
