import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { DomainError } from '@/domain/shared/errors'
import { getSupabaseEnv } from '@/lib/config/env'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  let url: string
  let anonKey: string

  try {
    const env = getSupabaseEnv()
    url = env.url
    anonKey = env.anonKey
  } catch {
    throw new DomainError('dependency_unavailable', 'O acesso ao serviço está indisponível no momento.')
  }

  const secure = process.env.NODE_ENV === 'production'

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure,
              sameSite: options?.sameSite ?? 'lax'
            })
          })
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes them.
        }
      }
    }
  })
}
