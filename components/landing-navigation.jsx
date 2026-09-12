'use client'

import { useState } from 'react'

const links = [
  ['#produto', 'O produto'],
  ['#como-funciona', 'Como funciona'],
  ['#possibilidades', 'Possibilidades']
]

export function LandingNavigation() {
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div className="ri-navigation roupzy-navigation">
      <nav className="ri-nav roupzy-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => <a href={href} onClick={closeMenu} key={href}>{label}</a>)}
      </nav>
      <button className="ri-mobile-toggle roupzy-mobile-toggle navigation-mobile-toggle" type="button" aria-expanded={open} aria-controls="roupzy-mobile-menu" onClick={() => setOpen((current) => !current)}>
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        <i aria-hidden="true" />
      </button>
      {open ? <nav className="ri-mobile-menu roupzy-mobile-menu" id="roupzy-mobile-menu" aria-label="Navegação móvel">
        <span className="ri-mobile-menu-label roupzy-mobile-menu-label">Explorar Roupzy</span>
        {links.map(([href, label]) => <a href={href} onClick={closeMenu} key={href}>{label}<span className="ri-arrow ri-arrow-down" aria-hidden="true" /></a>)}
      </nav> : null}
    </div>
  )
}
