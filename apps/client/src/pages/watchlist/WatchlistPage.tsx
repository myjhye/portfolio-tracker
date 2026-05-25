import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { watchlistApi } from "@/api/watchlist"
import { quoteApi } from "@/api/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── 관심 종목 한 행: 심볼 + 현재가 + 등락률 + 삭제 ──
function WatchlistRow({ symbol, onDelete }: { symbol: string; onDelete: () => void }) {
  // 1분마다 시세 자동 갱신
  const { data: quote } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => quoteApi.get(symbol),
    refetchInterval: 1000 * 60,
  })

  const isPositive = quote && quote.changePercent >= 0

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0">
      <div className="flex items-center gap-4">
        <span className="font-medium w-16">{symbol}</span>
        {quote ? (
          <>
            <span className="font-medium">${quote.price.toFixed(2)}</span>
            <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">로딩 중...</span>
        )}
      </div>
      <Button size="sm" variant="destructive" onClick={onDelete}>삭제</Button>
    </div>
  )
}

// ── 관심 종목 페이지 ──
// 기능: 심볼 입력으로 종목 추가 / 목록 조회 / 삭제
export default function WatchlistPage() {
  const queryClient = useQueryClient()
  const [symbol, setSymbol] = useState("")
  const [error, setError] = useState("")

  // ── 관심 종목 목록 조회 ──
  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistApi.getAll,
  })

  // ── 종목 추가: 성공 시 목록 갱신 + 입력 초기화 ──
  const addMutation = useMutation({
    mutationFn: (s: string) => watchlistApi.add(s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] })
      setSymbol("")
      setError("")
    },
    onError: () => setError("이미 추가된 종목이거나 존재하지 않는 심볼입니다"),
  })

  // ── 종목 삭제: 성공 시 목록 갱신 ──
  const deleteMutation = useMutation({
    mutationFn: (s: string) => watchlistApi.delete(s),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  })

  // 입력값 정리 후 추가 요청 (대문자 변환)
  const handleAdd = () => {
    const trimmed = symbol.trim().toUpperCase()
    if (!trimmed) return setError("심볼을 입력하세요")
    addMutation.mutate(trimmed)
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">관심 종목</h1>

      {/* ── 종목 추가 폼: Enter 키 또는 버튼으로 추가 ── */}
      <Card>
        <CardHeader><CardTitle>종목 추가</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="AAPL"
              className="uppercase"
            />
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? "추가 중..." : "추가"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* ── 관심 종목 목록: 각 행에서 시세 폴링 ── */}
      <Card>
        <CardHeader><CardTitle>목록</CardTitle></CardHeader>
        <CardContent className="p-0">
          {watchlist.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">관심 종목이 없습니다.</p>
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
