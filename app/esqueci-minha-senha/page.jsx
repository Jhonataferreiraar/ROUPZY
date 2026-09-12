import Link from 'next/link'

import { PasswordForm } from '@/components/password-form'
import { BrandMark } from '@/components/brand'
import { SiteFrame } from '@/components/site-frame'

export const metadata = {
  title: 'Esqueci minha senha | Roupzy',
  description: 'Recupere o acesso ao seu espaço Roupzy.'
}

export default function ForgotPasswordPage() {
  return (
    <SiteFrame>
      <section className="access-page shell">
        <div className="access-copy">
          <span className="section-kicker">ACESSO / RECUPERAÇÃO</span>
          <h1>Voltar para<br />{' '}<em>o seu espaço.</em></h1>
          <p>Digite o e-mail usado no cadastro. Enviaremos um link seguro para você voltar ao seu espaço.</p>
          <PasswordForm mode="forgot" />
          <div className="access-actions"><Link className="inline-action" href="/login">Voltar para entrar <span aria-hidden="true">↗</span></Link><Link className="inline-action" href="/contato">Falar com a gente <span aria-hidden="true">↗</span></Link></div>
        </div>
        <aside className="access-card"><BrandMark className="access-card-mark" size={48} /><div><small>STATUS DO ACESSO</small><strong>Recuperação<br />{' '}segura.</strong></div><span>Seu espaço continua pessoal e privado.</span></aside>
      </section>
    </SiteFrame>
  )
}
