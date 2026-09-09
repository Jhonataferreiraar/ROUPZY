import Image from 'next/image'
import Link from 'next/link'

import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Entrar | Roupzy',
  robots: { index: false, follow: false }
}

function safeNextPath(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/login') && !value.startsWith('/admin') ? value : '/app'
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const redirectTo = safeNextPath(params?.next)
  const oauthError = params?.erro === 'oauth-indisponivel' ? 'Esse provedor de acesso ainda não está disponível. Entre com e-mail e senha ou tente novamente mais tarde.' : params?.erro === 'link-invalido' ? 'O link de acesso expirou ou já foi utilizado. Solicite um novo link.' : ''

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Composição de peças de um guarda-roupa">
        <Image src="/images/dentro-wardrobe-system.png" alt="Ilustração tecnológica de um guarda-roupa com peças organizadas" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
        <div className="auth-visual-overlay"><span>ARQUIVO PESSOAL / 01</span><strong>Seu closet,<br />{' '}<em>em foco.</em></strong></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top"><Link className="brand-lockup" href="/" aria-label="Roupzy"><Image className="brand-symbol" src="/brand/roupzy-mark.svg" alt="" width={34} height={34} /><span className="brand-wordmark">ROUPZY</span></Link><Link className="auth-back" href="/">Voltar <span aria-hidden="true">↗</span></Link></div>
        <div className="auth-content"><p className="eyebrow">ÁREA PESSOAL</p><h1>Bom te ver<br />{' '}<em>de novo.</em></h1><p>Entre para continuar organizando as peças que já fazem parte da sua história.</p>{oauthError ? <p className="auth-feedback auth-feedback-error" role="alert">{oauthError}</p> : null}<div className="auth-status"><span aria-hidden="true"></span>Autenticação segura e privada.</div><AuthForm mode="login" redirectTo={redirectTo} /><div className="auth-links"><Link className="auth-link" href="/esqueci-minha-senha">Esqueci minha senha <span aria-hidden="true">↗</span></Link><Link className="auth-link" href="/cadastro">Ainda não tenho conta <span aria-hidden="true">↗</span></Link></div></div>
        <p className="auth-footer-note">Seu espaço é privado por princípio.</p>
      </section>
    </main>
  )
}
