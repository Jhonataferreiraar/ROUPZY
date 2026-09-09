import { productConfig } from '@/lib/config/product'

export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    {
      status: 'ok',
      service: productConfig.slug,
      phase: 'mvp'
    },
    {
      headers: { 'Cache-Control': 'no-store' }
    }
  )
}
