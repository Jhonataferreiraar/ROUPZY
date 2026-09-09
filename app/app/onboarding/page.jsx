import { redirect } from 'next/navigation'

import { OnboardingActions } from '@/components/onboarding-actions'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const { supabase, user, profile } = await getAuthContext()
  const countResult = await supabase.from('clothing_items').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).is('deleted_at', null)
  if (countResult.error) throw new DomainError('dependency_unavailable', 'Não foi possível verificar o início do seu closet.')
  const count = countResult.count || 0
  if (profile?.onboarding_status === 'completed' || (count || 0) > 0) redirect('/app')
  return (
    <div className="app-page shell app-narrow-page onboarding-page">
      <section className="onboarding-card">
        <div><span className="app-kicker">PRIMEIRO PASSO</span><h1>Vamos começar<br />{' '}<em>pelo que já é seu.</em></h1><p>Adicione algumas peças do seu armário. Uma foto por vez já é suficiente para o Roupzy começar a organizar possibilidades para você.</p></div>
        <div className="onboarding-roadmap"><div><span>01</span><strong>Fotografe</strong><small>Envie uma foto nítida da peça.</small></div><div><span>02</span><strong>Revise</strong><small>Confirme o que a análise encontrou.</small></div><div><span>03</span><strong>Vista</strong><small>Receba combinações para o seu momento.</small></div></div>
        <OnboardingActions />
      </section>
    </div>
  )
}
