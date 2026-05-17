import { z } from "zod"

export const CreatePortfolioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const UpdatePortfolioSchema = CreatePortfolioSchema.partial()

export type CreatePortfolioInput = z.infer<typeof CreatePortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof UpdatePortfolioSchema>
