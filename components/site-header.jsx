import Link from 'next/link'
import { Brand } from './brand'
import { SiteNavigation } from './site-navigation'
import { LandingNavigation } from './landing-navigation'

export function SiteHeader({ home = false }) {
  return (
    <header className={'ri-site-header' + (home ? ' ri-site-header-home' : '')}>
      <div className="ri-site-header-inner">
        <Link className="ri-site-brand" href="/" aria-label="Roupzy"><Brand /></Link>
        {home ? <LandingNavigation /> : <SiteNavigation />}
        <div className="ri-site-actions">
          <Link className="ri-site-login" href="/login">Entrar</Link>
          <Link className="ri-cta-button ri-cta-button-small" href="/cadastro">Começar <span className="ri-arrow" aria-hidden="true" /></Link>
        </div>
      </div>
    </header>
  )
}
