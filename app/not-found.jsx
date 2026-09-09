import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="error-state">
      <p className="eyebrow">404</p>
      <h1>Esta página não está no closet.</h1>
      <p>O endereço pode estar incorreto ou a página ainda não foi criada.</p>
      <Link className="button" href="/">Voltar para o início</Link>
    </main>
  )
}
