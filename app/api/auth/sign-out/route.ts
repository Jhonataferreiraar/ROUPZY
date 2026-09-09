import { NextResponse } from 'next/server'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
