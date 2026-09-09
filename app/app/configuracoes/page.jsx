import Link from 'next/link'

import { AccountDangerZone } from '@/components/account-danger-zone'
import { DataExportButton } from '@/components/data-export-button'
import { FeedbackForm } from '@/components/feedback-form'
import { PasswordChangeForm } from '@/components/password-change-form'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / CONFIGURAÇÕES</span><h1>Seu espaço,<br />{' '}<em>seu ritmo.</em></h1><p>Privacidade, acesso e escolhas de produto em um só lugar.</p></div></div>
      <section className="settings-list">
        <Link href="/app/perfil"><span>01</span><div><strong>Perfil e preferências</strong><small>Ajuste seu nome, sua vibe e as cores que prefere evitar.</small></div><b>↗</b></Link>
        <Link href="/privacidade"><span>02</span><div><strong>Privacidade</strong><small>Entenda como o Roupzy trata suas peças, imagens e escolhas.</small></div><b>↗</b></Link>
        <Link href="/app/assinatura"><span>03</span><div><strong>Assinatura e plano</strong><small>Consulte o plano vinculado à sua conta e os limites disponíveis.</small></div><b>↗</b></Link>
        <DataExportButton />
        <Link href="/contato"><span>04</span><div><strong>Ajuda e feedback</strong><small>Fale com a equipe sobre uma dúvida ou uma ideia.</small></div><b>↗</b></Link>
      </section>
      <section className="app-form-panel settings-feedback-panel">
        <div className="app-section-label"><span>05</span><span>Feedback do produto</span></div>
        <div className="settings-feedback-intro"><h2>Ajude a dar forma<br />{' '}<em>ao seu espaço.</em></h2><p>Seu retorno chega direto à equipe Roupzy para orientar correções e próximas melhorias.</p></div>
        <FeedbackForm />
      </section>
      <section className="app-form-panel account-security-panel">
        <div className="app-section-label"><span>06</span><span>Segurança da conta</span></div>
        <div className="settings-feedback-intro"><div><h2>Uma chave<br />{' '}<em>sempre sua.</em></h2><p>Atualize sua senha quando quiser. A sessão continua protegida pelo Supabase Auth.</p></div></div>
        <PasswordChangeForm />
      </section>
      <AccountDangerZone />
    </div>
  )
}
