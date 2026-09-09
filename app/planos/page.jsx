import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

import { SiteFrame } from '@/components/site-frame'
import { getSupabaseEnv } from '@/lib/config/env'
import { planCodeLabel } from '@/lib/ui/labels'

export const metadata = {
  title: 'Planos | Roupzy',
  description: 'Conheça a proposta de acesso do Roupzy.'
}

export const revalidate = 60

async function getPublishedPlans() {
  try {
    const { url, anonKey } = getSupabaseEnv()
    const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data } = await supabase.from('plans').select('id, code, name, description, price_minor, currency, billing_interval, features').eq('active', true).order('display_order', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

function planPrice(plan) {
  if (!plan.price_minor) return 'Gratuito'
  return (plan.price_minor / 100).toLocaleString('pt-BR', { style: 'currency', currency: plan.currency || 'BRL' }) + (plan.billing_interval === 'year' ? ' / ano' : ' / mês')
}

export default async function PlansPage() {
  const plans = await getPublishedPlans()
  return (
    <SiteFrame>
      <section className="simple-page-hero shell"><span className="section-kicker">PLANOS</span><h1>Comece com espaço<br />{' '}<em>para descobrir.</em></h1><p>Escolha o espaço que acompanha seu armário. Os recursos e limites abaixo vêm do catálogo publicado no Supabase.</p></section>
      <section className={'plans-section shell' + (plans.length === 1 ? ' plans-section-single' : '')} aria-labelledby="plans-title"><h2 className="sr-only" id="plans-title">Planos do Roupzy</h2>{plans.length ? plans.map((plan, index) => <article className={'plan-card ' + (index === 0 ? 'plan-card-featured' : '')} key={plan.id}><div><span className="plan-label">{planCodeLabel(plan.code)}</span><h2>{plan.name}</h2><p>{plan.description || 'Um espaço pensado para organizar suas peças e descobrir novas combinações.'}</p>{Array.isArray(plan.features) && plan.features.length ? <ul className="plan-features">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}</div><div className="plan-price">{planPrice(plan)}</div><div className="plan-status">Catálogo publicado. A contratação será liberada quando um provedor de cobrança real estiver conectado.</div><Link className="rz-button" href="/cadastro">Criar meu espaço <span aria-hidden="true">↗</span></Link></article>) : <><article className="plan-card plan-card-featured"><div><span className="plan-label">ABERTURA</span><h2>Seu primeiro closet</h2><p>Registre suas peças, organize seu espaço e experimente o método Roupzy.</p></div><div className="plan-status">O catálogo será carregado quando o banco estiver configurado.</div><Link className="rz-button" href="/cadastro">Criar meu espaço <span aria-hidden="true">↗</span></Link></article></>}</section>
      <section className="plans-note shell"><p>Os limites são aplicados no servidor e podem ser alterados pelo proprietário no painel global. O Roupzy não confirma pagamentos sem retorno verificado de um gateway.</p><Link className="rz-quiet-link" href="/termos">Ler os termos de uso <span aria-hidden="true">↗</span></Link></section>
    </SiteFrame>
  )
}
