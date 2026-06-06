import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { watchlistApi } from "@/api/watchlist"
import { quoteApi } from "@/api/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function WatchlistRow({ symbol, onDelete }: { symbol: string; onDelete: () => void }) {
  const { data: quote } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => quoteApi.get(symbol),
    refetchInterval: 1000 * 60,
  })

  const isPositive = quote && quote.changePercent >= 0

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-6">
        <span className="font-bold text-sm tracking-wide w-16">{symbol}</span>
        {quote ? (
          <div>
            <p className="text-sm font-semibold">${quote.price.toFixed(2)}</p>
            <p className={`text-xs ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {isPositive ? "▲" : "▼"} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">시세 조회 중...</p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive text-xs"
        onClick={onDelete}
      >
        삭제
      </Button>
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
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight">관심 종목</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {watchlist.length}개 종목 추적 중
        </p>
      </div>

      {/* 종목 추가 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            종목 추가
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="심볼 입력 (예: AAPL)"
              className="uppercase font-mono"
            />
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? "추가 중..." : "추가"}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* 종목 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {watchlist.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              관심 종목이 없습니다
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
        </CardContent>
      </Card>
    </div>
  )
}
