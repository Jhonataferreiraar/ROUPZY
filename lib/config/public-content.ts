import 'server-only'

import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { defaultPublicContent } from '@/lib/config/public-content-defaults'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const homeContentSchema = z.object({
  heroTitle: z.string().trim().min(1).max(100),
  heroHighlight: z.string().trim().min(1).max(100),
  heroDescription: z.string().trim().min(1).max(500),
  heroCta: z.string().trim().min(1).max(80),
  footerLead: z.string().trim().min(1).max(160)
}).partial().strict()

const faqItemSchema = z.object({
  question: z.string().trim().min(1).max(180),
  answer: z.string().trim().min(1).max(800)
}).strict()

const publicContentSchema = z.object({
  home: homeContentSchema.optional(),
  faq: z.array(faqItemSchema).min(1).max(20).optional()
}).strict()

let cachedContent: { expiresAt: number; value: typeof defaultPublicContent } | null = null
let pendingLoad: Promise<typeof defaultPublicContent> | null = null

export function clearPublicContentCache() {
  cachedContent = null
}

function mergeContent(value: unknown) {
  const parsed = publicContentSchema.safeParse(value)
  if (!parsed.success) return defaultPublicContent
  return {
    home: { ...defaultPublicContent.home, ...parsed.data.home },
    faq: parsed.data.faq || defaultPublicContent.faq
  }
}

export function parsePublicContent(value: unknown) {
  const parsed = publicContentSchema.safeParse(value)
  if (!parsed.success) throw new DomainError('validation', 'O conteúdo público não passou na validação.')
  return {
    home: { ...defaultPublicContent.home, ...parsed.data.home },
    faq: parsed.data.faq || defaultPublicContent.faq
  }
}

export async function getPublicContent() {
  if (cachedContent && cachedContent.expiresAt > Date.now()) return cachedContent.value
  if (pendingLoad) return pendingLoad

  pendingLoad = (async () => {
    let value = defaultPublicContent
    try {
      const admin = createSupabaseAdminClient()
      const { data, error } = await admin.from('system_settings').select('value').eq('key', 'public.site_content').maybeSingle()
      if (!error && data?.value) value = mergeContent(data.value)
    } catch {
      value = defaultPublicContent
    }
    cachedContent = { expiresAt: Date.now() + 60 * 1000, value }
    return value
  })()

  try {
    return await pendingLoad
  } finally {
    pendingLoad = null
  }
}
