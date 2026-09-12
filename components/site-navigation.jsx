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
    <div className="ri-navigation site-navigation" key={pathname}>
      <nav className="ri-nav site-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => <Link className={isActive(pathname, href) ? 'is-active' : ''} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} key={href}>{label}</Link>)}
      </nav>
      <button className="ri-mobile-toggle site-mobile-toggle navigation-mobile-toggle" type="button" aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => setOpen((current) => !current)}>
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        <i aria-hidden="true" />
      </button>
      {open ? <nav className="ri-mobile-menu site-mobile-menu" id="site-mobile-menu" aria-label="Navegação móvel">
        <span className="ri-mobile-menu-label site-mobile-menu-label">Navegação</span>
        {links.map(([href, label]) => <Link className={isActive(pathname, href) ? 'is-active' : ''} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} onClick={closeMenu} key={href}>{label}<span className="ri-arrow" aria-hidden="true" /></Link>)}
      </nav> : null}
    </div>
  )
}
