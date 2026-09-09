import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Moderação', robots: { index: false, follow: false } }

export default async function ModerationPage() {
  await requireAdmin()
  return <section className="admin-section-page rv-admin-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Conteúdo compartilhado</span><h2>Moderação</h2><p>Controle publicações e denúncias sem abrir acesso geral ao closet privado dos usuários.</p></div><span className="admin-section-page-index">◌</span></div>
    <section className="rv-module-note rv-admin-privacy-note"><div><span>PRIVACIDADE COMO REGRA</span><h2>Nenhuma fila pública ativa.</h2></div><p>O compartilhamento público ainda não está habilitado. Por isso, não há imagens privadas expostas para revisão. Quando o recurso for ativado, somente conteúdo publicado voluntariamente poderá entrar nesta fila.</p></section>
    <div className="rv-admin-empty-board"><span>FILA DE REVISÃO</span><strong>0</strong><p>itens aguardando moderação</p><div><i /> Compartilhamento público desativado</div></div>
  </section>
}
