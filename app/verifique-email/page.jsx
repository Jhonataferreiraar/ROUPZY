import Link from 'next/link'

import { Brand } from '@/components/brand'

export const metadata = { title: 'Confirme seu e-mail | Roupzy', robots: { index: false, follow: false } }

export default async function VerifyEmailPage({ searchParams }) {
  const params = await searchParams
  const email = typeof params?.email === 'string' ? params.email : ''
  return <main className="rv-confirm-page"><section><Link href="/" aria-label="Roupzy"><Brand /></Link><div className="rv-confirm-mark" aria-hidden="true">@</div><span>ÚLTIMO PASSO DO CADASTRO</span><h1>Abra seu e-mail.<br />{' '}<em>Seu closet espera.</em></h1><p>Enviamos um link de confirmação{email ? <> para <strong>{email}</strong></> : null}. Depois de confirmar, você poderá entrar e começar a registrar suas peças.</p><div className="rv-confirm-actions"><Link className="rv-button rv-button-primary" href="/login">Ir para a entrada <span>↗</span></Link><Link className="rv-button rv-button-quiet" href="/contato">Preciso de ajuda <span>↗</span></Link></div><small>O link é validado pelo Supabase Auth e pode expirar por segurança.</small></section></main>
}
