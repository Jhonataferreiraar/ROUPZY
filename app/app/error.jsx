'use client'

import Link from 'next/link'

export default function AppError({ reset }) {
  return (
    <section className="app-page shell app-error-state" role="alert">
      <span className="app-kicker">SEU ESPAÇO / PAUSA</span>
      <h1>Essa área demorou<br />{' '}<em>mais que o esperado.</em></h1>
      <p>Recarregue os dados ou volte para uma área do seu closet que já está pronta.</p>
      <div className="app-error-actions"><button className="app-primary-button" type="button" onClick={() => reset()}>Tentar novamente <span>↗</span></button><Link className="app-outline-button" href="/app">Voltar à visão geral <span>↗</span></Link></div>
    </section>
  )
}
