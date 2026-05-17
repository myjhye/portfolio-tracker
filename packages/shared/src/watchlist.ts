import { z } from "zod"

export const AddWatchlistSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
})

export type AddWatchlistInput = z.infer<typeof AddWatchlistSchema>
