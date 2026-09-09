import { ProfileForm } from '@/components/profile-form'
import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { supabase, user, profile } = await getAuthContext()
  const preferences = requireSupabaseResult(await supabase.from('user_preferences').select('default_vibe, preferred_formality, avoided_colors, units').eq('owner_id', user.id).maybeSingle(), 'Não foi possível carregar suas preferências.')
  return (
    <div className="app-page shell app-narrow-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / SEU PERFIL</span><h1>O que veste<br />{' '}<em>você?</em></h1><p>Essas escolhas ajudam o motor a encontrar combinações mais próximas do seu jeito.</p></div></div>
      <section className="app-form-panel"><div className="app-section-label"><span>01</span><span>Preferências pessoais</span></div><ProfileForm profile={profile} preferences={preferences} /><p className="app-private-note">As preferências ficam vinculadas apenas à sua conta.</p><p className="app-private-note">{user.email}</p></section>
    </div>
  )
}
