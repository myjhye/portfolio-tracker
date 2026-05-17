import { z } from "zod"

export const AddHoldingSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
})

export const UpdateHoldingSchema = z.object({
  quantity: z.number().positive().optional(),
  avgPrice: z.number().positive().optional(),
}).refine(data => data.quantity !== undefined || data.avgPrice !== undefined, {
  message: "quantity 또는 avgPrice 중 하나는 필수",
})

export type AddHoldingInput = z.infer<typeof AddHoldingSchema>
export type UpdateHoldingInput = z.infer<typeof UpdateHoldingSchema>
