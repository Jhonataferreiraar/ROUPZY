import { productConfig } from '@/lib/config/product'

export const dynamic = 'force-static'

export function GET() {
  return Response.json({
    name: productConfig.name,
    slogan: productConfig.slogan,
    locale: productConfig.locale,
    currency: productConfig.currency
  })
}
