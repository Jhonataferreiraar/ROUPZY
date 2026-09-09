import Link from 'next/link'
import { Brand } from './brand'
import { SiteNavigation } from './site-navigation'
import { LandingNavigation } from './landing-navigation'

export function SiteHeader({ home = false }) {
  return (
    <header className="rz-header">
      <div className="rz-shell rz-header-inner">
        <Link className="rz-header-brand" href="/" aria-label="Roupzy"><Brand /></Link>
        {home ? <LandingNavigation /> : <SiteNavigation />}
        <div className="rz-header-actions">
          <Link className="rz-header-login" href="/login">Entrar</Link>
          <Link className="rz-button rz-button-small" href="/cadastro">Começar <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  )
}
