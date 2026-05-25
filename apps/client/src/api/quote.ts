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

export interface HistoryPoint {
  date: string
  close: number
}

export const historyApi = {
  get: (symbol: string) =>
    api.get<HistoryPoint[]>(`/quotes/${symbol}/history`).then((r) => r.data),
}
