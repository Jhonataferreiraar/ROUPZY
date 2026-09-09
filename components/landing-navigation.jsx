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
    <div className="roupzy-navigation">
      <nav className="roupzy-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => <a href={href} onClick={closeMenu} key={href}>{label}</a>)}
      </nav>
      <button className="roupzy-mobile-toggle navigation-mobile-toggle" type="button" aria-expanded={open} aria-controls="roupzy-mobile-menu" onClick={() => setOpen((current) => !current)}>
        <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        <i aria-hidden="true" />
      </button>
      {open ? <nav className="roupzy-mobile-menu" id="roupzy-mobile-menu" aria-label="Navegação móvel">
        <span className="roupzy-mobile-menu-label">Explorar Roupzy</span>
        {links.map(([href, label]) => <a href={href} onClick={closeMenu} key={href}>{label}<span aria-hidden="true">↓</span></a>)}
      </nav> : null}
    </div>
  )
}
