import Link from 'next/link'

import { PasswordForm } from '@/components/password-form'
import { SiteFrame } from '@/components/site-frame'

export const metadata = {
  title: 'Redefinir senha | Roupzy',
  description: 'Redefina com segurança a senha do seu espaço Roupzy.'
}

export default function ResetPasswordPage() {
  return (
    <SiteFrame>
      <section className="access-page shell">
        <div className="access-copy">
          <span className="section-kicker">ACESSO / NOVA SENHA</span>
          <h1>Uma nova chave<br />{' '}<em>para o seu espaço.</em></h1>
          <p>Escolha uma nova senha para recuperar o acesso ao seu espaço. O link precisa ter sido aberto a partir do e-mail de recuperação.</p>
          <PasswordForm mode="reset" />
          <div className="access-actions"><Link className="inline-action" href="/login">Voltar para entrar <span aria-hidden="true">↗</span></Link><Link className="inline-action" href="/esqueci-minha-senha">Pedir outro link <span aria-hidden="true">↗</span></Link></div>
        </div>
        <aside className="access-card"><span className="access-card-mark">R</span><div><small>SEGURANÇA</small><strong>O seu acesso<br />{' '}fica com você.</strong></div><span>O link é validado pelo Supabase Auth.</span></aside>
      </section>
    </SiteFrame>
  )
}
