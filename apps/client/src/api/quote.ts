import api from "../lib/api"

export interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  fromCache: boolean
}

export const quoteApi = {
  get: (symbol: string) => api.get<Quote>(`/quotes/${symbol}`).then((r) => r.data),
}
