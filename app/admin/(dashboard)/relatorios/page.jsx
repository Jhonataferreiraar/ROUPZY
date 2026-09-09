import Link from 'next/link'

import { getAdminDashboardData } from '@/lib/admin/dashboard-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Relatórios', robots: { index: false, follow: false } }

export default async function ReportsPage() {
  await requireAdmin()
  const data = await getAdminDashboardData()
  const max = Math.max(...data.signups.map((item) => item.value), 1)
  return <section className="admin-section-page rv-admin-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Leitura do negócio</span><h2>Relatórios</h2><p>Analise crescimento, ativação e uso com dados consolidados diretamente da plataforma.</p></div><span className="admin-section-page-index">↗</span></div>
    <div className="rv-admin-metrics"><article><span>USUÁRIOS TOTAIS</span><strong>{data.metrics.totalUsers}</strong><small>{data.metrics.activeUsers} ativos em 30 dias</small></article><article><span>NOVOS CADASTROS</span><strong>{data.metrics.newUsers}</strong><small>últimos 30 dias</small></article><article><span>PEÇAS CADASTRADAS</span><strong>{data.metrics.pieces}</strong><small>acervo ativo da plataforma</small></article><article><span>LOOKS CRIADOS</span><strong>{data.metrics.looks}</strong><small>{data.metrics.used} usos registrados</small></article></div>
    <div className="rv-admin-report-grid"><section className="rv-admin-chart"><div className="rv-module-panel-head"><div><span>CRESCIMENTO</span><h2>Cadastros por dia</h2></div><strong>14 dias</strong></div><div className="rv-report-bars">{data.signups.map((item) => <div key={item.day}><span style={{ height: `${Math.max((item.value / max) * 100, 3)}%` }} /><small>{item.day}</small></div>)}</div></section><aside className="rv-module-aside"><span>EXPORTAÇÃO</span><h2>Relatórios auditáveis.</h2><p>Os números desta página vêm das tabelas reais. A exportação de dados pessoais exige definição de escopo e política de retenção.</p><Link className="app-outline-button" href="/admin/auditoria">Abrir auditoria <span>↗</span></Link></aside></div>
  </section>
}
