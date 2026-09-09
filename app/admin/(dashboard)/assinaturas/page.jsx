import Link from 'next/link'

import { getBillingOverview } from '@/lib/admin/extended-data'
import { requireAdmin } from '@/lib/auth/server'
import { subscriptionStatusLabel } from '@/lib/ui/labels'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Assinaturas', robots: { index: false, follow: false } }

export default async function AdminSubscriptionsPage() {
  await requireAdmin()
  const data = await getBillingOverview()
  const active = data.subscriptions.filter((item) => ['active', 'trialing'].includes(item.status)).length
  const overdue = data.subscriptions.filter((item) => ['past_due', 'unpaid'].includes(item.status)).length
  const confirmedRevenue = data.events.filter((event) => event.status === 'processed').reduce((total, event) => total + (event.amount_minor || 0), 0)

  return <section className="admin-section-page rv-admin-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Receita e cobrança</span><h2>Assinaturas</h2><p>Acompanhe contratos, eventos confirmados e situações que precisam de atenção.</p></div><span className="admin-section-page-index">$</span></div>
    <div className="rv-admin-metrics"><article><span>ATIVAS</span><strong>{active}</strong><small>inclui períodos de teste</small></article><article><span>COM PENDÊNCIA</span><strong>{overdue}</strong><small>pagamento vencido ou não pago</small></article><article><span>RECEITA CONFIRMADA</span><strong>{(confirmedRevenue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><small>eventos processados disponíveis</small></article></div>
    <section className="rv-admin-table-panel"><div className="rv-module-panel-head"><div><span>CONTRATOS</span><h2>Assinaturas recentes</h2></div><Link href="/admin/produto">Gerenciar planos ↗</Link></div><div className="rv-table-scroll"><table><caption className="sr-only">Assinaturas recentes do Roupzy</caption><thead><tr><th scope="col">Conta</th><th scope="col">Plano</th><th scope="col">Provedor</th><th scope="col">Situação</th><th scope="col">Próximo ciclo</th></tr></thead><tbody>{data.subscriptions.length ? data.subscriptions.map((item) => <tr key={item.id}><td>{item.owner_id.slice(0, 8)}…</td><td>{item.plans?.name || 'Sem plano'}</td><td>{item.provider}</td><td><span className={`rv-status rv-status-${item.status}`}>{subscriptionStatusLabel(item.status)}</span></td><td>{item.current_period_end ? new Date(item.current_period_end).toLocaleDateString('pt-BR') : '—'}</td></tr>) : <tr><td colSpan="5"><div className="rv-table-empty">Nenhuma assinatura registrada.</div></td></tr>}</tbody></table></div></section>
  </section>
}
