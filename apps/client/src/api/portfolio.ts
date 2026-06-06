import api from "../lib/api"
import { type Holding } from "./holding"

export interface Portfolio {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  holdingCount?: number
  symbols?: string[]
  holdings?: Holding[]
}

export const portfolioApi = {
  getAll: () => api.get<Portfolio[]>("/portfolios").then((r) => r.data),
  getOne: (id: string) => api.get<Portfolio>(`/portfolios/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Portfolio>("/portfolios", data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Portfolio>(`/portfolios/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/portfolios/${id}`).then((r) => r.data),
}
