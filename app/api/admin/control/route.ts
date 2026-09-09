import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAdminControlData } from '@/lib/admin/control-data'
import { requireAdmin } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { clearPublicContentCache, parsePublicContent } from '@/lib/config/public-content'

const jsonValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown())
])

const mutationSchema = z.discriminatedUnion('resource', [
  z.object({
    resource: z.literal('plan'),
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500),
    priceMinor: z.number().int().min(0).max(100000000),
    billingInterval: z.enum(['month', 'year', 'one_time']),
    active: z.boolean(),
    displayOrder: z.number().int().min(0).max(10000),
    limits: z.record(z.string(), z.number().int().min(0).max(1000000)),
    features: z.array(z.string().trim().min(1).max(160)).max(30)
  }).strict(),
  z.object({
    resource: z.literal('flag'),
    key: z.string().trim().min(1).max(120).regex(/^[a-z0-9_-]+$/),
    enabled: z.boolean(),
    rolloutPercent: z.number().int().min(0).max(100)
  }).strict(),
  z.object({
    resource: z.literal('setting'),
    key: z.string().trim().min(1).max(120).regex(/^[a-z0-9_.-]+$/),
    value: jsonValueSchema
  }).strict(),
  z.object({
    resource: z.literal('contact'),
    id: z.string().uuid(),
    status: z.enum(['new', 'in_progress', 'resolved', 'spam'])
  }).strict(),
  z.object({
    resource: z.literal('feedback'),
    id: z.string().uuid(),
    status: z.enum(['new', 'reviewing', 'resolved', 'archived']),
    response: z.string().trim().max(2000)
  }).strict()
])

const createSchema = z.discriminatedUnion('resource', [
  z.object({
    resource: z.literal('plan'),
    code: z.string().trim().min(2).max(50).regex(/^[a-z0-9_-]+$/),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional().default(''),
    priceMinor: z.number().int().min(0).max(100000000),
    billingInterval: z.enum(['month', 'year', 'one_time']).default('month'),
    active: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(10000).default(0),
    limits: z.record(z.string(), z.number().int().min(0).max(1000000)).default({}),
    features: z.array(z.string().trim().min(1).max(160)).max(30).default([])
  }).strict(),
  z.object({
    resource: z.literal('flag'),
    key: z.string().trim().min(1).max(120).regex(/^[a-z0-9_-]+$/),
    enabled: z.boolean().default(false),
    rolloutPercent: z.number().int().min(0).max(100).default(0)
  }).strict(),
  z.object({
    resource: z.literal('setting'),
    key: z.string().trim().min(1).max(120).regex(/^[a-z0-9_.-]+$/),
    value: jsonValueSchema
  }).strict()
])

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const section = new URL(request.url).searchParams.get('section')
    return NextResponse.json(await getAdminControlData(section))
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const { user, role } = await requireAdmin()
    if (role === 'support') throw new DomainError('forbidden', 'Sua função permite apenas leitura.')

    const input = mutationSchema.parse(await request.json())
    const admin = createSupabaseAdminClient()
    let resourceId = ''
    let action = ''
    let result: { error: unknown } = { error: null }

    if (input.resource === 'plan') {
      resourceId = input.id
      action = 'update_plan'
      result = await admin.from('plans').update({
        name: input.name,
        description: input.description || null,
        price_minor: input.priceMinor,
        billing_interval: input.billingInterval,
        active: input.active,
        display_order: input.displayOrder,
        limits: input.limits,
        features: input.features
      }).eq('id', input.id)
    }

    if (input.resource === 'flag') {
      resourceId = input.key
      action = 'update_feature_flag'
      result = await admin.from('feature_flags').upsert({
        key: input.key,
        enabled: input.enabled,
        rollout_percent: input.rolloutPercent,
        updated_by: user.id
      }, { onConflict: 'key' })
    }

    if (input.resource === 'setting') {
      resourceId = input.key
      action = 'update_system_setting'
      const value = input.key === 'public.site_content' ? parsePublicContent(input.value) : input.value
      result = await admin.from('system_settings').upsert({
        key: input.key,
        value,
        updated_by: user.id,
        environment: 'production'
      }, { onConflict: 'key' })
    }

    if (input.resource === 'contact') {
      resourceId = input.id
      action = 'update_contact_request'
      result = await admin.from('contact_requests').update({ status: input.status }).eq('id', input.id)
    }

    if (input.resource === 'feedback') {
      resourceId = input.id
      action = 'update_feedback'
      result = await admin.from('feedback').update({
        status: input.status,
        response: input.response || null
      }).eq('id', input.id)
    }

    if (result.error) throw new DomainError('dependency_unavailable', 'Não foi possível salvar essa alteração.')

    if (input.resource === 'setting' && input.key === 'public.site_content') {
      clearPublicContentCache()
      revalidatePath('/')
      revalidatePath('/faq')
    }

    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: role,
      action,
      resource_type: input.resource,
      resource_id: resourceId,
      outcome: 'success',
      metadata: { source: 'admin_control_panel' }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { user, role } = await requireAdmin()
    if (role === 'support') throw new DomainError('forbidden', 'Sua função permite apenas leitura.')

    const input = createSchema.parse(await request.json())
    const admin = createSupabaseAdminClient()
    let resourceId = ''
    let action = ''
    let result: { data: { id?: string; code?: string; key?: string } | null; error: { code?: string } | null } = { data: null, error: null }

    if (input.resource === 'plan') {
      result = await admin.from('plans').insert({
        code: input.code,
        name: input.name,
        description: input.description || null,
        price_minor: input.priceMinor,
        currency: 'BRL',
        billing_interval: input.billingInterval,
        active: input.active,
        display_order: input.displayOrder,
        limits: input.limits,
        features: input.features
      }).select('id, code').single()
      resourceId = result.data?.id || input.code
      action = 'create_plan'
    }

    if (input.resource === 'flag') {
      result = await admin.from('feature_flags').insert({
        key: input.key,
        enabled: input.enabled,
        rollout_percent: input.rolloutPercent,
        updated_by: user.id
      }).select('key').single()
      resourceId = input.key
      action = 'create_feature_flag'
    }

    if (input.resource === 'setting') {
      result = await admin.from('system_settings').insert({
        key: input.key,
        value: input.key === 'public.site_content' ? parsePublicContent(input.value) : input.value,
        updated_by: user.id,
        environment: 'production'
      }).select('key').single()
      resourceId = input.key
      action = 'create_system_setting'
    }

    if (result.error) {
      if (result.error.code === '23505') throw new DomainError('conflict', 'Já existe um registro com esse identificador.')
      throw new DomainError('dependency_unavailable', 'Não foi possível cadastrar esse item.')
    }

    if (input.resource === 'setting' && input.key === 'public.site_content') {
      clearPublicContentCache()
      revalidatePath('/')
      revalidatePath('/faq')
    }

    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: role,
      action,
      resource_type: input.resource,
      resource_id: resourceId,
      outcome: 'success',
      metadata: { source: 'admin_control_panel' }
    })

    return NextResponse.json({ ok: true, resourceId })
  } catch (error) {
    return safeJsonError(error)
  }
}
