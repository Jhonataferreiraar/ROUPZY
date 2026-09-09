import { z } from 'zod'

export const clothingCategorySchema = z.enum([
  'top',
  'bottom',
  'one_piece',
  'outerwear',
  'shoe',
  'bag',
  'accessory',
  'unknown'
])

export const clothingPatternSchema = z.enum([
  'solid',
  'stripe',
  'plaid',
  'floral',
  'graphic',
  'animal',
  'other',
  'unknown'
])

export const clothingFitSchema = z.enum(['slim', 'regular', 'relaxed', 'oversized', 'unknown'])

export const clothingColorSchema = z.object({
  name: z.string().min(1).max(60),
  family: z.string().min(1).max(60),
  confidence: z.number().min(0).max(1).optional()
}).strict()

export const clothingAttributesSchema = z.object({
  category: clothingCategorySchema,
  subcategory: z.string().max(120).nullable().optional(),
  colors: z.array(clothingColorSchema).max(8),
  pattern: clothingPatternSchema,
  material: z.string().max(120).nullable().optional(),
  fit: clothingFitSchema,
  formality: z.number().int().min(1).max(5),
  seasons: z.array(z.string().min(1).max(40)).max(8),
  weatherRange: z.object({
    minC: z.number().min(-50).max(70).nullable(),
    maxC: z.number().min(-50).max(70).nullable()
  }).strict()
}).strict()

export const clothingCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: clothingCategorySchema.default('unknown'),
  subcategory: z.string().trim().max(120).nullable().optional(),
  colors: z.array(clothingColorSchema).max(8).default([]),
  pattern: clothingPatternSchema.default('unknown'),
  material: z.string().trim().max(120).nullable().optional(),
  fit: clothingFitSchema.default('unknown'),
  formality: z.number().int().min(1).max(5).default(3),
  seasons: z.array(z.string().trim().min(1).max(40)).max(8).default(['all_year']),
  weatherRange: z.object({
    minC: z.number().min(-50).max(70).nullable().default(null),
    maxC: z.number().min(-50).max(70).nullable().default(null)
  }).strict().default({ minC: null, maxC: null }),
  notes: z.string().trim().max(1000).nullable().optional()
}).strict()

export const clothingUpdateSchema = clothingCreateSchema.partial().extend({
  availability: z.enum(['active', 'laundry', 'repair', 'archived']).optional()
}).strict()

export type ClothingAttributes = z.infer<typeof clothingAttributesSchema>
export type ClothingCreateInput = z.infer<typeof clothingCreateSchema>
export type ClothingUpdateInput = z.infer<typeof clothingUpdateSchema>
