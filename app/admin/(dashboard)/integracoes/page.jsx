import { getIntegrationOverview } from '@/lib/admin/extended-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Integrações', robots: { index: false, follow: false } }

const definitions = {
  database: ['Supabase Database', 'Perfis, peças, looks, preferências e dados operacionais.'],
  storage: ['Supabase Storage', 'Imagens privadas organizadas por usuário e entregues por URL assinada.'],
  ai: ['Gemini', 'Análise multimodal de peças atrás da camada de provedor do Roupzy.'],
  billing: ['Provedor de cobrança', 'Assinaturas e eventos financeiros confirmados por webhook.']
}

export default async function IntegrationsPage() {
  await requireAdmin()
  const status = await getIntegrationOverview()
  return <section className="admin-section-page rv-admin-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Infraestrutura conectada</span><h2>Integrações</h2><p>Veja quais serviços estão disponíveis. Chaves, tokens e valores secretos nunca aparecem nesta página.</p></div><span className="admin-section-page-index">⌘</span></div>
    <section className="rv-integration-grid">{Object.entries(definitions).map(([key, [name, description]]) => <article key={key}><div className="rv-integration-state"><i className={status[key] ? 'is-ready' : ''} /><span>{status[key] ? 'Configurada' : 'Aguardando configuração'}</span></div><h3>{name}</h3><p>{description}</p><small>{status[key] ? 'O serviço respondeu à verificação segura.' : 'Conclua as variáveis do servidor para ativar.'}</small></article>)}</section>
  </section>
}
