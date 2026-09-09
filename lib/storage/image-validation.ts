import 'server-only'

import { createHash } from 'node:crypto'

import { productLimits } from '@/lib/config/limits'
import { inspectImageBytes } from '@/lib/storage/image-validation-core'

export async function validateImageFile(file: File) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const image = inspectImageBytes(file.type, bytes, {
    maxBytes: productLimits.maxUploadBytes,
    maxWidth: productLimits.maxImageWidth,
    maxHeight: productLimits.maxImageHeight
  }, file.name)
  const sha256 = createHash('sha256').update(Buffer.from(bytes)).digest('hex')
  return { ...image, byteSize: file.size, sha256 }
}
