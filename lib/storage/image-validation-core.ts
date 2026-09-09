import { DomainError } from '../../domain/shared/errors.ts'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

function readUint32(view: DataView, offset: number) {
  return view.getUint32(offset, false)
}

function detectImage(bytes: Uint8Array) {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    return { mimeType: 'image/png', extension: 'png', width: readUint32(view, 16), height: readUint32(view, 20) }
  }
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    let offset = 2
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1
        continue
      }
      const marker = bytes[offset + 1]
      const length = view.getUint16(offset + 2, false)
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        return { mimeType: 'image/jpeg', extension: 'jpg', height: view.getUint16(offset + 5, false), width: view.getUint16(offset + 7, false) }
      }
      offset += Math.max(2, length + 2)
    }
  }
  if (bytes.length >= 30 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
    const chunk = String.fromCharCode(...bytes.slice(12, 16))
    if (chunk === 'VP8X') {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16)
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
      return { mimeType: 'image/webp', extension: 'webp', width, height }
    }
    if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
      const width = 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8))
      const height = 1 + (((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10)))
      return { mimeType: 'image/webp', extension: 'webp', width, height }
    }
    if (chunk === 'VP8 ' && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
      return { mimeType: 'image/webp', extension: 'webp', width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
    }
    return { mimeType: 'image/webp', extension: 'webp', width: null, height: null }
  }
  return null
}

export function inspectImageBytes(fileType: string, bytes: Uint8Array, limits: { maxBytes: number; maxWidth: number; maxHeight: number }, fileName = '') {
  if (!allowedTypes.has(fileType)) throw new DomainError('validation', 'Use uma imagem JPG, PNG ou WebP.')
  if (bytes.length <= 0 || bytes.length > limits.maxBytes) throw new DomainError('validation', 'A imagem precisa ter até 10 MB.')
  const image = detectImage(bytes)
  if (!image) throw new DomainError('validation', 'Não reconhecemos o conteúdo real dessa imagem.')
  if (image.mimeType !== fileType) throw new DomainError('validation', 'O tipo informado não corresponde ao conteúdo da imagem.')
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const validExtensions = image.mimeType === 'image/jpeg' ? ['jpg', 'jpeg'] : [image.extension]
  if (extension && !validExtensions.includes(extension)) throw new DomainError('validation', 'A extensão do arquivo não corresponde ao conteúdo da imagem.')
  if (image.width && image.width > limits.maxWidth || image.height && image.height > limits.maxHeight) {
    throw new DomainError('validation', 'A imagem excede a dimensão máxima permitida.')
  }
  return image
}
