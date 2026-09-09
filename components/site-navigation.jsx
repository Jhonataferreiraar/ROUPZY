'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  ['/sobre', 'A empresa'],
  ['/como-funciona', 'Como funciona'],
  ['/recursos', 'Recursos'],
  ['/planos', 'Planos'],
  ['/faq', 'FAQ']
]

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function SiteNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div className="site-navigation" key={pathname}>
      <nav className="site-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => <Link className={isActive(pathname, href) ? 'is-active' : ''} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} key={href}>{label}</Link>)}
      </nav>
      <button className="site-mobile-toggle navigation-mobile-toggle" type="button" aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => setOpen((current) => !current)}>
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        <i aria-hidden="true" />
      </button>
      {open ? <nav className="site-mobile-menu" id="site-mobile-menu" aria-label="Navegação móvel">
        <span className="site-mobile-menu-label">Navegação</span>
        {links.map(([href, label]) => <Link className={isActive(pathname, href) ? 'is-active' : ''} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} onClick={closeMenu} key={href}>{label}<span aria-hidden="true">↗</span></Link>)}
      </nav> : null}
    </div>
  )
}
