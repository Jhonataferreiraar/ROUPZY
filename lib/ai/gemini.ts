import 'server-only'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import { clothingAttributesSchema, type ClothingAttributes } from '@/domain/clothing/schema'
import { DomainError } from '@/domain/shared/errors'
import {
  inspirationAnalysisSchema,
  type AIProvider,
  type AIResult,
  type AnalyzeClothingInput,
  type AnalyzeInspirationInput,
  type ExplainOutfitInput,
  type InspirationAnalysis,
  type RankOutfitsInput
} from '@/lib/ai/provider'
import { getServerEnv } from '@/lib/config/env'

const jsonSchema = z.record(z.string(), z.unknown())

function parseModelJson(text: string) {
  const fence = String.fromCharCode(96).repeat(3)
  const trimmed = text.trim()
  const normalized = trimmed.startsWith(fence)
    ? trimmed.slice(fence.length).replace(/^json\s*/i, '').replace(fence, '').trim()
    : trimmed
  return jsonSchema.parse(JSON.parse(normalized))
}

type GenerationInput = {
  prompt: string
  imageBase64?: string
  mimeType?: string
}

export class GeminiProvider implements AIProvider {
  readonly provider = 'gemini'
  readonly model: string
  private readonly apiKey: string

  constructor(apiKey: string, model = 'gemini-2.0-flash') {
    this.apiKey = apiKey
    this.model = model
  }

  private async generate(input: GenerationInput) {
    const started = Date.now()
    const parts: Array<Record<string, unknown>> = [{ text: input.prompt }]
    if (input.imageBase64 && input.mimeType) parts.push({ inlineData: { mimeType: input.mimeType, data: input.imageBase64 } })
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + encodeURIComponent(this.apiKey)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      }),
      signal: AbortSignal.timeout(20000)
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new DomainError('dependency_unavailable', 'A credencial do provedor de análise foi rejeitada. Verifique GEMINI_API_KEY.')
      if (response.status === 404) throw new DomainError('dependency_unavailable', 'O modelo de análise configurado não foi encontrado. Verifique GEMINI_MODEL.')
      if (response.status === 429) throw new DomainError('rate_limited', 'O provedor de análise atingiu um limite temporário. Tente novamente em instantes.')
      throw new DomainError('dependency_unavailable', response.status >= 500 ? 'O provedor de análise está indisponível no momento. Tente novamente em instantes.' : 'O provedor recusou a análise enviada.')
    }
    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === 'string')?.text
    if (!text) throw new DomainError('dependency_unavailable', 'O provedor não retornou uma análise utilizável.')
    return {
      parsed: parseModelJson(text),
      durationMs: Date.now() - started,
      inputTokens: payload?.usageMetadata?.promptTokenCount ?? null,
      outputTokens: payload?.usageMetadata?.candidatesTokenCount ?? null
    }
  }

  async analyzeClothing(input: AnalyzeClothingInput): Promise<AIResult<ClothingAttributes>> {
    const result = await this.generate({
      ...input,
      prompt: 'Analise apenas a peça visível. Responda JSON com category, subcategory, colors, pattern, material, fit, formality, seasons e weatherRange. Use as categorias top, bottom, one_piece, outerwear, shoe, bag, accessory ou unknown. Use unknown quando não souber. colors tem name, family e confidence de 0 a 1. formality é inteiro de 1 a 5. weatherRange tem minC e maxC numéricos ou null. Não invente atributos invisíveis.'
    })
    return {
      data: clothingAttributesSchema.parse(result.parsed),
      provider: this.provider,
      model: this.model,
      operation: 'analyzeClothing',
      requestKey: input.requestKey,
      durationMs: result.durationMs,
      usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens, estimatedCostMinor: null }
    }
  }

  async analyzeInspiration(input: AnalyzeInspirationInput): Promise<AIResult<InspirationAnalysis>> {
    const result = await this.generate({ ...input, prompt: 'Descreva somente os elementos visíveis de uma referência de roupa. Responda JSON com categories, colors, silhouette, layers, formality, texture e occasion. Não identifique pessoas nem atributos sensíveis.' })
    return { data: inspirationAnalysisSchema.parse(result.parsed), provider: this.provider, model: this.model, operation: 'analyzeInspiration', requestKey: input.requestKey, durationMs: result.durationMs, usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens, estimatedCostMinor: null } }
  }

  async rankOutfits(input: RankOutfitsInput): Promise<AIResult<Array<{ itemIds: string[]; explanation: string }>>> {
    const result = await this.generate({ prompt: 'Ordene os candidatos abaixo sem criar, remover ou alterar IDs. Responda JSON com candidates, lista de objetos com itemIds e explanation. ' + JSON.stringify(input.candidates) })
    const data = z.object({ candidates: z.array(z.object({ itemIds: z.array(z.string()), explanation: z.string().max(1000) })) }).strict().parse(result.parsed).candidates
    const allowed = new Set(input.candidates.flatMap((candidate) => candidate.itemIds))
    if (data.some((candidate) => candidate.itemIds.some((id) => !allowed.has(id)))) throw new DomainError('dependency_unavailable', 'O ranking retornou uma peça fora dos candidatos.')
    return { data, provider: this.provider, model: this.model, operation: 'rankOutfits', requestKey: input.requestKey, durationMs: result.durationMs, usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens, estimatedCostMinor: null } }
  }

  async explainOutfit(input: ExplainOutfitInput): Promise<AIResult<string>> {
    const result = await this.generate({ prompt: 'Escreva uma explicação curta e honesta em português do Brasil para este look. Use somente as peças listadas e a ocasião informada. Responda JSON com a chave explanation. ' + JSON.stringify({ itemNames: input.itemNames, occasion: input.occasion, vibe: input.vibe }) })
    const data = z.object({ explanation: z.string().trim().min(1).max(1000) }).strict().parse(result.parsed)
    return { data: data.explanation, provider: this.provider, model: this.model, operation: 'explainOutfit', requestKey: input.requestKey, durationMs: result.durationMs, usage: { inputTokens: result.inputTokens, outputTokens: result.outputTokens, estimatedCostMinor: null } }
  }
}

export function createAIProvider(): AIProvider {
  const env = getServerEnv()
  if (!env.GEMINI_API_KEY) throw new DomainError('dependency_unavailable', 'A análise de imagem ainda não está configurada.')
  return new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL || 'gemini-2.0-flash')
}

export function createAIRequestKey(prefix: string) {
  // A failed attempt must not block a later retry through ai_usage.request_key's unique index.
  return prefix + ':' + randomUUID()
}
