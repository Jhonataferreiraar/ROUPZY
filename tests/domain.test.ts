import assert from 'node:assert/strict'
import test from 'node:test'

import { matchInspiration } from '../domain/inspiration/matcher.ts'
import { generateOutfits } from '../domain/outfits/engine.ts'
import { inspectImageBytes } from '../lib/storage/image-validation-core.ts'

test('outfit engine returns no more than three valid combinations', () => {
  const pieces = [
    { id: 'top-1', name: 'Camisa azul', category: 'top' as const, colors: [{ name: 'azul', family: 'azul' }], formality: 3 },
    { id: 'top-2', name: 'Camisa branca', category: 'top' as const, colors: [{ name: 'branco', family: 'branco' }], formality: 4 },
    { id: 'bottom-1', name: 'Calça preta', category: 'bottom' as const, colors: [{ name: 'preto', family: 'preto' }], formality: 3 },
    { id: 'shoe-1', name: 'Tênis branco', category: 'shoe' as const, colors: [{ name: 'branco', family: 'branco' }], formality: 2 }
  ]
  const outfits = generateOutfits(pieces, { occasion: 'trabalho', vibe: 'casual', avoidedColors: [] })
  assert.ok(outfits.length > 0)
  assert.ok(outfits.length <= 3)
  assert.ok(outfits.every((outfit) => outfit.itemIds.every((id) => pieces.some((piece) => piece.id === id))))
})

test('inspiration matcher returns explainable real closet IDs', () => {
  const matches = matchInspiration({ categories: ['top'], colors: ['azul'], silhouette: 'top', layers: [], formality: 3, texture: null, occasion: 'casual' }, [
    { id: 'piece-1', name: 'Camisa azul', category: 'top', colors: [{ name: 'azul', family: 'azul' }], formality: 3 },
    { id: 'piece-2', name: 'Calça preta', category: 'bottom', colors: [{ name: 'preto', family: 'preto' }], formality: 3 }
  ])
  assert.equal(matches[0]?.clothingItemId, 'piece-1')
  assert.ok(matches[0]?.score > 0)
  assert.match(matches[0]?.explanation || '', /cor|categoria/)
})

test('image validation rejects bytes that only pretend to be PNG', async () => {
  const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  assert.throws(() => inspectImageBytes('image/png', bytes, { maxBytes: 10 * 1024 * 1024, maxWidth: 12000, maxHeight: 12000 }), { message: 'Não reconhecemos o conteúdo real dessa imagem.' })
})

test('image validation rejects a misleading file extension', () => {
  const bytes = new Uint8Array(24)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  assert.throws(() => inspectImageBytes('image/png', bytes, { maxBytes: 10 * 1024 * 1024, maxWidth: 12000, maxHeight: 12000 }, 'roupa.jpg'), { message: 'A extensão do arquivo não corresponde ao conteúdo da imagem.' })
})

test('image validation checks dimensions in lossless WebP files', () => {
  const bytes = new Uint8Array(30)
  bytes.set([...Buffer.from('RIFF'), 22, 0, 0, 0, ...Buffer.from('WEBP'), ...Buffer.from('VP8L')], 0)
  bytes[20] = 0x2f
  bytes[21] = 199
  bytes[22] = 192
  bytes[23] = 74
  assert.throws(() => inspectImageBytes('image/webp', bytes, { maxBytes: 10 * 1024 * 1024, maxWidth: 100, maxHeight: 100 }), { message: 'A imagem excede a dimensão máxima permitida.' })
})
