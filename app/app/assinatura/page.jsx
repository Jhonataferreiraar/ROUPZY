import Link from 'next/link'

import { getAuthContext } from '@/lib/auth/server'
import { subscriptionStatusLabel } from '@/lib/ui/labels'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function SubscriptionPage() {
  const { supabase, user } = await getAuthContext()
  const subscription = requireSupabaseResult(await supabase.from('subscriptions').select('id, provider, status, current_period_end, cancel_at_period_end, plans(name, description)').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(), 'Não foi possível carregar o estado da sua assinatura.')
  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / ASSINATURA</span><h1>O plano que<br />{' '}<em>acompanha você.</em></h1><p>Veja o estado real da sua assinatura e os limites ligados à sua conta.</p></div><Link className="app-outline-button" href="/planos">Conhecer planos <span>↗</span></Link></div>
      <section className="subscription-card"><div className="app-section-label"><span>01</span><span>Estado atual</span></div>{subscription ? <><h2>{subscription.plans?.name || 'Plano Roupzy'}</h2><p>{subscription.plans?.description || 'Assinatura registrada no provedor.'}</p><strong className="subscription-status">{subscriptionStatusLabel(subscription.status)}</strong>{subscription.current_period_end ? <small>Próximo ciclo: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</small> : null}</> : <><h2>Seu espaço está no começo.</h2><p>Ainda não há uma assinatura vinculada. Quando a cobrança real estiver configurada, você poderá escolher um plano e acompanhar tudo por aqui.</p><Link className="app-primary-button" href="/planos">Ver planos disponíveis <span>↗</span></Link></>}</section>
    </div>
  )
}
