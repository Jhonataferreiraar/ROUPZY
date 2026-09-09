'use client'

export default function GlobalError({ reset }) {
  return (
    <main className="error-state" role="alert">
      <p className="eyebrow">Algo saiu do lugar</p>
      <h1>Não conseguimos carregar esta página.</h1>
      <p>Tente novamente. Se o problema continuar, volte mais tarde.</p>
      <button className="button" type="button" onClick={() => reset()}>Tentar novamente</button>
    </main>
  )
}
