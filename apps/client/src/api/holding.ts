import api from "../lib/api"

export interface Holding {
  id: string
  symbol: string
  quantity: number
  avgPrice: number
  order: number
  portfolioId: string
}

export const holdingApi = {
  add: (portfolioId: string, data: { symbol: string; quantity: number; avgPrice: number }) =>
    api.post<Holding>(`/portfolios/${portfolioId}/holdings`, data).then((r) => r.data),
  update: (portfolioId: string, id: string, data: { quantity?: number; avgPrice?: number }) =>
    api.patch<Holding>(`/portfolios/${portfolioId}/holdings/${id}`, data).then((r) => r.data),
  delete: (portfolioId: string, id: string) =>
    api.delete(`/portfolios/${portfolioId}/holdings/${id}`).then((r) => r.data),
  reorder: (portfolioId: string, ids: string[]) =>
    api.patch(`/portfolios/${portfolioId}/holdings/reorder`, { ids }).then((r) => r.data),
}
