import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function SiteFrame({ children }) {
  return (
      <main id="top" className="inner-site rq-inner-new rz-public ri-public-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  )
}
