import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { watchlistApi } from "@/api/watchlist"
import { quoteApi } from "@/api/quote"

function WatchlistRow({ symbol, onDelete }: { symbol: string; onDelete: () => void }) {
  const { data: quote } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => quoteApi.get(symbol),
    refetchInterval: 1000 * 60 * 60 * 24, // 24시간
  })

  const isPositive = quote && quote.changePercent >= 0

  return (
    <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low transition-colors group">
      {/* 심볼 + 시세 */}
      <div className="flex items-center gap-lg">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-body-md shrink-0">
          {symbol[0]}
        </div>
        <div>
          <p className="text-body-md font-bold text-primary">{symbol}</p>
          {quote ? (
            <p className={`text-caption flex items-center gap-[2px] ${isPositive ? "text-[#1a7f37]" : "text-error"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {isPositive ? "arrow_drop_up" : "arrow_drop_down"}
              </span>
              {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
            </p>
          ) : (
            <p className="text-caption text-on-surface-variant">조회 중...</p>
          )}
        </div>
      </div>

      {/* 현재가 + 삭제 */}
      <div className="flex items-center gap-md">
        {quote && (
          <p className="text-data-lg-mono text-[16px] text-primary">
            ${quote.price.toFixed(2)}
          </p>
        )}
        <button
          onClick={onDelete}
          className="p-xs hover:bg-error-container text-error rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-[20px]">delete_outline</span>
        </button>
      </div>
    </div>
  )
}

export default function WatchlistPage() {
  const queryClient = useQueryClient()
  const [symbol, setSymbol] = useState("")
  const [error, setError] = useState("")

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistApi.getAll,
  })

  const addMutation = useMutation({
    mutationFn: (s: string) => watchlistApi.add(s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] })
      setSymbol("")
      setError("")
    },
    onError: () => setError("이미 추가된 종목이거나 존재하지 않는 심볼입니다"),
  })

  const deleteMutation = useMutation({
    mutationFn: (s: string) => watchlistApi.delete(s),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  })

  const handleAdd = () => {
    const trimmed = symbol.trim().toUpperCase()
    if (!trimmed) return setError("심볼을 입력하세요")
    addMutation.mutate(trimmed)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-md">
      불러오는 중...
    </div>
  )

  return (
    <div>
      {/* 헤더 */}
      <section className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="text-headline-lg font-bold text-primary mb-base">관심 종목</h1>
          <p className="text-body-md text-on-surface-variant">{watchlist.length}개 종목 추적 중</p>
        </div>
      </section>

      {/* 종목 추가 */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm mb-md">
        <p className="text-label-mono text-on-surface-variant uppercase tracking-wider mb-md">
          종목 추가
        </p>
        <div className="flex gap-sm">
          <input
            value={symbol}
            onChange={(e) => { setSymbol(e.target.value); setError("") }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="심볼 입력 (예: AAPL)"
            className="flex-1 bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm text-body-md font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-secondary transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={addMutation.isPending}
            className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-mono hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {addMutation.isPending ? "추가 중..." : "추가"}
          </button>
        </div>
        {error && <p className="text-caption text-error mt-xs">{error}</p>}
      </div>

      {/* 종목 목록 */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-md py-sm border-b border-outline-variant/20 bg-surface-container-low/30">
          <p className="text-label-mono text-on-surface-variant uppercase tracking-wider">
            목록
          </p>
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-md">
              bookmark
            </span>
            <p className="text-body-md text-on-surface-variant">관심 종목이 없습니다</p>
            <p className="text-caption text-on-surface-variant/60 mt-xs">
              심볼을 입력해서 추적할 종목을 추가하세요
            </p>
          </div>
        ) : (
          watchlist.map((item) => (
            <WatchlistRow
              key={item.id}
              symbol={item.symbol}
              onDelete={() => deleteMutation.mutate(item.symbol)}
            />
          ))
        )}
      </div>
    </div>
  )
}
