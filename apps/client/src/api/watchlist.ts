import api from "../lib/api"

export interface WatchlistItem {
  id: string
  symbol: string
  createdAt: string
}

// ── 관심 종목 API ──
export const watchlistApi = {
  getAll: () => api.get<WatchlistItem[]>("/watchlist").then((r) => r.data),              // 전체 조회
  add: (symbol: string) => api.post<WatchlistItem>("/watchlist", { symbol }).then((r) => r.data),  // 종목 추가
  delete: (symbol: string) => api.delete(`/watchlist/${symbol}`).then((r) => r.data),    // 종목 삭제
}
