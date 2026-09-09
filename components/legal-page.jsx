import { SiteFrame } from './site-frame'

export function LegalPage({ kicker, title, intro, updated, children }) {
  return (
    <SiteFrame>
      <section className="legal-hero shell"><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{intro}</p><small>Última atualização: {updated}</small></section>
      <article className="legal-content shell">{children}</article>
    </SiteFrame>
  )
}
