export type OutfitPiece = {
  id: string
  name: string
  category: 'top' | 'bottom' | 'one_piece' | 'outerwear' | 'shoe' | 'bag' | 'accessory' | 'unknown'
  colors: Array<{ name: string; family: string }>
  formality: number
  seasons?: string[]
  availability?: string
}

export type OutfitRequest = {
  occasion: string
  vibe: string
  preferredFormality?: number | null
  avoidedColors?: string[]
  weatherC?: number | null
}

export type OutfitCandidate = {
  itemIds: string[]
  score: number
  explanation: string
  engineVersion: string
}

const ENGINE_VERSION = 'deterministic-2026-09-07'
const neutralFamilies = new Set(['neutro', 'preto', 'branco', 'cinza', 'bege', 'marrom', 'azul-marinho'])
const familyGroups: Record<string, string> = {
  vermelho: 'quente',
  laranja: 'quente',
  amarelo: 'quente',
  rosa: 'quente',
  verde: 'natural',
  azul: 'frio',
  roxo: 'frio',
  lilas: 'frio',
  preto: 'neutro',
  branco: 'neutro',
  cinza: 'neutro',
  bege: 'neutro',
  marrom: 'neutro',
  'azul-marinho': 'neutro',
  neutro: 'neutro'
}

function normalize(value: string | undefined | null) {
  return (value ?? '').trim().toLowerCase()
}

function familyOf(piece: OutfitPiece) {
  return normalize(piece.colors[0]?.family || piece.colors[0]?.name)
}

function colorScore(pieces: OutfitPiece[]) {
  const families = pieces.map(familyOf).filter(Boolean)
  if (families.length < 2) return 0.62
  if (families.every((family) => neutralFamilies.has(family))) return 0.94
  const groups = new Set(families.map((family) => familyGroups[family] || family))
  if (groups.size === 1) return 0.9
  if (families.some((family) => neutralFamilies.has(family))) return 0.86
  return groups.size === 2 ? 0.76 : 0.58
}

function occasionScore(pieces: OutfitPiece[], request: OutfitRequest) {
  const occasion = normalize(request.occasion)
  const target = occasion.includes('formal') || occasion.includes('evento')
    ? 4
    : occasion.includes('trabalho') || occasion.includes('reuni')
      ? 3.5
      : occasion.includes('noite') || occasion.includes('jantar')
        ? 3
        : 2
  const average = pieces.reduce((total, piece) => total + piece.formality, 0) / pieces.length
  return Math.max(0, 1 - Math.abs(average - target) / 4)
}

function vibeScore(pieces: OutfitPiece[], vibe: string) {
  const normalized = normalize(vibe)
  const average = pieces.reduce((total, piece) => total + piece.formality, 0) / pieces.length
  if (normalized.includes('refinado') || normalized.includes('elegante')) return average >= 3.2 ? 0.94 : 0.65
  if (normalized.includes('leve') || normalized.includes('casual')) return average <= 3.4 ? 0.92 : 0.68
  if (normalized.includes('criativo') || normalized.includes('marcante')) return 0.82
  return 0.76
}

function weatherScore(pieces: OutfitPiece[], weatherC: number | null | undefined) {
  if (weatherC === null || weatherC === undefined) return 0.72
  const fits = pieces.filter((piece) => {
    const season = (piece.seasons || []).map(normalize)
    if (!season.length || season.includes('all_year')) return true
    if (weatherC >= 25) return season.some((item) => item.includes('summer') || item.includes('verao'))
    if (weatherC <= 18) return season.some((item) => item.includes('winter') || item.includes('inverno'))
    return true
  })
  return fits.length === pieces.length ? 0.95 : 0.58
}

function hasAvoidedColor(pieces: OutfitPiece[], avoidedColors: string[]) {
  const avoided = avoidedColors.map(normalize).filter(Boolean)
  return pieces.some((piece) => piece.colors.some((color) => {
    const name = normalize(color.name)
    const family = normalize(color.family)
    return avoided.includes(name) || avoided.includes(family)
  }))
}

function scorePieces(pieces: OutfitPiece[], request: OutfitRequest) {
  const color = colorScore(pieces)
  const occasion = occasionScore(pieces, request)
  const vibe = vibeScore(pieces, request.vibe)
  const weather = weatherScore(pieces, request.weatherC)
  const formality = request.preferredFormality
    ? Math.max(0, 1 - Math.abs((pieces.reduce((total, piece) => total + piece.formality, 0) / pieces.length) - request.preferredFormality) / 4)
    : 0.72
  const penalty = hasAvoidedColor(pieces, request.avoidedColors || []) ? 0.45 : 0
  const score = (color * 0.3) + (occasion * 0.25) + (vibe * 0.2) + (weather * 0.1) + (formality * 0.15) - penalty
  return Math.max(0, Math.min(1, Number(score.toFixed(5))))
}

function explanationFor(pieces: OutfitPiece[], request: OutfitRequest) {
  const names = pieces.map((piece) => piece.name).join(', ')
  const colorText = colorScore(pieces) >= 0.84
    ? ' As cores conversam entre si sem disputar atenção.'
    : ' A combinação cria contraste para trazer personalidade.'
  return names + ' formam uma base coerente para ' + request.occasion.toLowerCase() + '.' + colorText
}

function uniqueCombinations(pieces: OutfitPiece[]) {
  const tops = pieces.filter((piece) => piece.category === 'top')
  const bottoms = pieces.filter((piece) => piece.category === 'bottom')
  const onePieces = pieces.filter((piece) => piece.category === 'one_piece')
  const shoes = pieces.filter((piece) => piece.category === 'shoe')
  const combinations: OutfitPiece[][] = []
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) combinations.push([top, bottom, shoe])
    }
  }
  for (const onePiece of onePieces) {
    for (const shoe of shoes) combinations.push([onePiece, shoe])
  }
  return combinations
}

export function generateOutfits(pieces: OutfitPiece[], request: OutfitRequest): OutfitCandidate[] {
  const available = pieces.filter((piece) => !piece.availability || piece.availability === 'active')
  const ranked = uniqueCombinations(available)
    .filter((combination) => !hasAvoidedColor(combination, request.avoidedColors || []))
    .map((combination) => ({
      itemIds: combination.map((piece) => piece.id),
      score: scorePieces(combination, request),
      explanation: explanationFor(combination, request),
      engineVersion: ENGINE_VERSION
    }))
    .sort((a, b) => b.score - a.score || a.itemIds.join().localeCompare(b.itemIds.join()))
  const output: OutfitCandidate[] = []
  for (const candidate of ranked) {
    const overlap = output.some((existing) => {
      const shared = existing.itemIds.filter((id) => candidate.itemIds.includes(id)).length
      return shared === candidate.itemIds.length
    })
    if (!overlap) output.push(candidate)
    if (output.length === 3) break
  }
  return output
}
