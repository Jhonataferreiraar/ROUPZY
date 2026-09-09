import { getAiOverview } from '@/lib/admin/extended-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inteligência artificial', robots: { index: false, follow: false } }

export default async function AdminAiPage() {
  await requireAdmin()
  const rows = await getAiOverview()
  const failures = rows.filter((row) => row.status !== 'success').length
  const durations = rows.map((row) => row.duration_ms).filter((value) => typeof value === 'number')
  const average = durations.length ? Math.round(durations.reduce((total, value) => total + value, 0) / durations.length) : null
  const cost = rows.reduce((total, row) => total + (row.estimated_cost_minor || 0), 0)
  return <section className="admin-section-page rv-admin-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Modelos e qualidade</span><h2>Inteligência artificial</h2><p>Consulte chamadas reais, falhas, custo estimado e latência sem expor credenciais.</p></div><span className="admin-section-page-index">IA</span></div>
    <div className="rv-admin-metrics"><article><span>CHAMADAS NA AMOSTRA</span><strong>{rows.length}</strong><small>últimos registros disponíveis</small></article><article><span>FALHAS</span><strong>{failures}</strong><small>respostas diferentes de sucesso</small></article><article><span>LATÊNCIA MÉDIA</span><strong>{average ? `${average} ms` : '—'}</strong><small>apenas chamadas com duração</small></article><article><span>CUSTO ESTIMADO</span><strong>{cost ? (cost / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não calculado'}</strong><small>valor registrado pelo provedor</small></article></div>
    <section className="rv-admin-table-panel"><div className="rv-module-panel-head"><div><span>RASTREABILIDADE</span><h2>Chamadas recentes</h2></div><strong>{rows.length} registros</strong></div><div className="rv-table-scroll"><table><caption className="sr-only">Chamadas recentes de inteligência artificial</caption><thead><tr><th scope="col">Operação</th><th scope="col">Modelo</th><th scope="col">Situação</th><th scope="col">Tokens</th><th scope="col">Duração</th><th scope="col">Quando</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td>{row.operation}</td><td>{row.provider} / {row.model}</td><td><span className={`rv-status ${row.status === 'success' ? 'rv-status-active' : 'rv-status-past_due'}`}>{row.status === 'success' ? 'Concluída' : 'Falhou'}</span></td><td>{(row.input_tokens || 0) + (row.output_tokens || 0)}</td><td>{row.duration_ms ? `${row.duration_ms} ms` : '—'}</td><td>{new Date(row.created_at).toLocaleString('pt-BR')}</td></tr>) : <tr><td colSpan="6"><div className="rv-table-empty">Nenhuma chamada registrada.</div></td></tr>}</tbody></table></div></section>
  </section>
}
