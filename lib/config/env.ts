import 'server-only'

import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
})

const optionalServerString = (minimumLength = 1) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().min(minimumLength).optional()
)

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalServerString(),
  GEMINI_API_KEY: optionalServerString(),
  GEMINI_MODEL: optionalServerString(),
  BILLING_PROVIDER: optionalServerString(),
  BILLING_WEBHOOK_SECRET: optionalServerString(),
  SESSION_SECRET: optionalServerString(32),
  JOB_SECRET: optionalServerString(32)
})

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    BILLING_PROVIDER: process.env.BILLING_PROVIDER,
    BILLING_WEBHOOK_SECRET: process.env.BILLING_WEBHOOK_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    JOB_SECRET: process.env.JOB_SECRET
  })
}

export function getSupabaseEnv() {
  const env = getPublicEnv()
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}
