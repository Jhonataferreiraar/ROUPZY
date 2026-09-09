import { z } from 'zod'

import { clothingAttributesSchema, type ClothingAttributes } from '@/domain/clothing/schema'

export const inspirationAnalysisSchema = z.object({
  categories: z.array(z.string().min(1).max(60)).max(12),
  colors: z.array(z.string().min(1).max(60)).max(12),
  silhouette: z.string().max(160),
  layers: z.array(z.string().max(80)).max(8),
  formality: z.number().int().min(1).max(5),
  texture: z.string().max(120).nullable(),
  occasion: z.string().max(120).nullable()
}).strict()

export type InspirationAnalysis = z.infer<typeof inspirationAnalysisSchema>
export type AIUsage = {
  inputTokens: number | null
  outputTokens: number | null
  estimatedCostMinor: number | null
}

export type AIResult<T> = {
  data: T
  provider: string
  model: string
  operation: string
  requestKey: string
  durationMs: number
  usage: AIUsage
}

export type AnalyzeClothingInput = {
  imageBase64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  requestKey: string
}

export type AnalyzeInspirationInput = {
  imageBase64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  requestKey: string
}

export type RankOutfitsInput = {
  candidates: Array<{ itemIds: string[]; score: number; explanation: string }>
  requestKey: string
}

export type ExplainOutfitInput = {
  itemNames: string[]
  occasion: string
  vibe: string
  requestKey: string
}

export interface AIProvider {
  analyzeClothing(input: AnalyzeClothingInput): Promise<AIResult<ClothingAttributes>>
  analyzeInspiration(input: AnalyzeInspirationInput): Promise<AIResult<InspirationAnalysis>>
  rankOutfits(input: RankOutfitsInput): Promise<AIResult<Array<{ itemIds: string[]; explanation: string }>>>
  explainOutfit(input: ExplainOutfitInput): Promise<AIResult<string>>
}
