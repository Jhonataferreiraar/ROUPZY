export default function Loading() {
  return (
    <main className="loading-state" aria-busy="true" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <p>Preparando seu espaço...</p>
    </main>
  )
}
