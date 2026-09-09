'use client'

import Link from 'next/link'

export default function AdminError({ reset }) {
  return (
    <section className="admin-section-page admin-error-state" role="alert">
      <div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Roupzy / Administração</span><h2>Não foi possível carregar esta área.</h2><p>Os dados continuam protegidos. Tente novamente ou retorne à visão geral do painel.</p></div><span className="admin-section-page-index">!</span></div>
      <div className="admin-error-actions"><button className="admin-primary-action" type="button" onClick={() => reset()}>Tentar novamente</button><Link className="admin-secondary-action" href="/admin">Voltar à visão geral</Link></div>
    </section>
  )
}
