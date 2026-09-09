import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AuthForm } from '@/components/auth-form'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Acesso administrativo | Roupzy',
  robots: { index: false, follow: false }
}

async function hasAdminSession() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: role } = await supabase
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .maybeSingle()
    return Boolean(role)
  } catch {
    return false
  }
}

function safeAdminNextPath(value) {
  return typeof value === 'string' && (value === '/admin' || (value.startsWith('/admin/') && value !== '/admin/login')) ? value : '/admin'
}

export default async function AdminLoginPage({ searchParams }) {
  if (await hasAdminSession()) redirect('/admin')
  const params = await searchParams
  const denied = params?.erro === 'sem-acesso'
  const redirectTo = safeAdminNextPath(params?.next)

  return <main className="admin-login-page">
    <section className="admin-login-visual" aria-label="Visão geral da operação do Roupzy">
      <div className="admin-login-orbit admin-login-orbit-one" aria-hidden="true" />
      <div className="admin-login-orbit admin-login-orbit-two" aria-hidden="true" />
      <div className="admin-login-visual-top"><span className="admin-login-mark">R</span><span>ROUPZY / OPERAÇÃO</span><span>ACESSO RESTRITO</span></div>
      <div className="admin-login-visual-content"><span className="admin-login-kicker">CENTRAL DO NEGÓCIO</span><h1>Decisões mais<br />{' '}<em>claras.</em></h1><p>Uma visão protegida para acompanhar usuários, produto, operação e segurança do Roupzy.</p><div className="admin-login-signal"><i /><span>Ambiente administrativo ativo</span><b>SUPABASE</b></div></div>
      <div className="admin-login-visual-grid" aria-hidden="true"><span /><span /><span /><span /></div>
    </section>
    <section className="admin-login-panel">
      <div className="admin-login-panel-top"><Link className="admin-login-brand" href="/admin/login" aria-label="Roupzy, acesso administrativo"><span>R</span><strong>ROUPZY</strong></Link><Link className="admin-login-back" href="/">Voltar ao site <span aria-hidden="true">↗</span></Link></div>
      <div className="admin-login-content"><span className="admin-login-kicker">PAINEL DE ADMINISTRAÇÃO</span><h2>Bem-vindo<br />{' '}<em>de volta.</em></h2><p>Entre com uma conta autorizada para acessar o controle geral do Roupzy.</p>{denied ? <p className="admin-login-denied" role="alert">Essa conta não possui permissão administrativa.</p> : null}<div className="admin-login-status"><i aria-hidden="true" /> Sessão protegida e monitorada.</div><AuthForm endpoint="/api/auth/admin-sign-in" redirectTo={redirectTo} submitLabel="Entrar no painel" allowSocial={false} /><Link className="admin-login-forgot" href="/esqueci-minha-senha">Esqueci minha senha <span aria-hidden="true">↗</span></Link></div>
      <div className="admin-login-footer"><span>ACESSO DO CLIENTE</span><Link href="/login">Entrar no meu espaço <span aria-hidden="true">↗</span></Link></div>
    </section>
  </main>
}
