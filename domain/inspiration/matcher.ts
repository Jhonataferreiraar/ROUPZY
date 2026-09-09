export type InspirationTarget = {
  categories: string[]
  colors: string[]
  silhouette: string
  layers: string[]
  formality: number
  texture: string | null
  occasion: string | null
}

export type InspirationMatchPiece = {
  id: string
  name: string
  category: string
  colors: Array<{ name: string; family: string }>
  formality: number
}

export type InspirationMatch = {
  clothingItemId: string
  score: number
  matchType: 'color' | 'silhouette' | 'layer' | 'texture' | 'occasion' | 'mixed'
  explanation: string
}

const normalize = (value: string | null | undefined) => (value || '').trim().toLowerCase()

function includesSimilar(values: string[], target: string) {
  const normalizedTarget = normalize(target)
  return values.some((value) => {
    const normalized = normalize(value)
    return normalized && (normalizedTarget.includes(normalized) || normalized.includes(normalizedTarget))
  })
}

function colorMatch(target: InspirationTarget, piece: InspirationMatchPiece) {
  const pieceColors = piece.colors.flatMap((color) => [color.name, color.family])
  return target.colors.length > 0 && target.colors.some((color) => includesSimilar(pieceColors, color))
}

function categoryMatch(target: InspirationTarget, piece: InspirationMatchPiece) {
  return target.categories.length > 0 && target.categories.some((category) => includesSimilar([piece.category], category))
}

function scorePiece(target: InspirationTarget, piece: InspirationMatchPiece) {
  const color = colorMatch(target, piece)
  const category = categoryMatch(target, piece)
  const formality = Math.max(0, 1 - Math.abs(piece.formality - target.formality) / 4)
  const silhouette = includesSimilar([piece.category], target.silhouette)
  const layers = target.layers.some((layer) => includesSimilar([piece.category], layer))
  const occasion = target.occasion ? includesSimilar([piece.category], target.occasion) : false
  const score = (color ? 0.35 : 0) + (category ? 0.3 : 0) + (formality * 0.2) + (silhouette ? 0.08 : 0) + (layers ? 0.04 : 0) + (occasion ? 0.03 : 0)
  return { score: Number(Math.min(1, score).toFixed(5)), color, category, silhouette, layers, occasion }
}

export function matchInspiration(target: InspirationTarget, pieces: InspirationMatchPiece[], limit = 8): InspirationMatch[] {
  return pieces
    .filter((piece) => piece.category !== 'unknown')
    .map((piece) => {
      const signals = scorePiece(target, piece)
      const signalNames = [
        signals.color ? 'cor' : '',
        signals.category ? 'categoria' : '',
        signals.silhouette ? 'silhueta' : '',
        signals.layers ? 'camada' : ''
      ].filter(Boolean)
      const matchType: InspirationMatch['matchType'] = signalNames.length > 1 ? 'mixed' : signals.color ? 'color' : signals.category ? 'silhouette' : signals.layers ? 'layer' : 'occasion'
      const explanation = signalNames.length
        ? 'Combina por ' + signalNames.join(', ') + ' e formalidade próxima da referência.'
        : 'É uma alternativa do seu closet com formalidade próxima da referência.'
      return { clothingItemId: piece.id, score: signals.score, matchType, explanation }
    })
    .sort((a, b) => b.score - a.score || a.clothingItemId.localeCompare(b.clothingItemId))
    .slice(0, limit)
}
