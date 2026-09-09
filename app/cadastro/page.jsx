import Image from 'next/image'
import Link from 'next/link'

import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Criar conta | Roupzy',
  robots: { index: false, follow: false }
}

export default function SignupPage() {
  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Composição de peças de um guarda-roupa">
        <Image src="/images/dentro-wardrobe-system.png" alt="Ilustração tecnológica de um guarda-roupa com peças organizadas" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
        <div className="auth-visual-overlay"><span>PRIMEIRO REGISTRO / 01</span><strong>Comece pelo que<br />{' '}<em>já é seu.</em></strong></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><Link className="brand-lockup" href="/" aria-label="Roupzy"><Image className="brand-symbol" src="/brand/roupzy-mark.svg" alt="" width={34} height={34} /><span className="brand-wordmark">ROUPZY</span></Link><Link className="auth-back" href="/">Voltar <span aria-hidden="true">↗</span></Link></div>
        <div className="auth-content"><p className="eyebrow">SEU PRÓXIMO LOOK</p><h1>Crie seu<br />{' '}<em>espaço pessoal.</em></h1><p>Um lugar para registrar suas peças e deixar seu jeito de vestir mais claro.</p><div className="auth-status"><span aria-hidden="true"></span>Cadastro seguro e privado.</div><AuthForm mode="signup" /><div className="auth-links"><Link className="auth-link" href="/login">Já tenho uma conta <span aria-hidden="true">↗</span></Link></div></div>
        <p className="auth-footer-note">Sem peças inventadas. Sem recomendações aleatórias.</p>
      </section>
    </main>
  )
}
