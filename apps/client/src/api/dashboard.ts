import api from "../lib/api"

export interface PortfolioSummary {
  id: string
  name: string
  description?: string
  holdingCount: number
  symbols: string[]
  totalCost: number
}

export interface DashboardData {
  portfolioCount: number
  totalHoldingCount: number
  portfolios: PortfolioSummary[]
}

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard").then((r) => r.data),
}
