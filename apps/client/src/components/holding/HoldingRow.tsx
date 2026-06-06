import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"
import { type Holding } from "@/api/holding"
import { Button } from "@/components/ui/button"
import PriceChart from "@/components/chart/PriceChart"
import ErrorBoundary from "@/components/common/ErrorBoundary"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export default function HoldingRow({ holding, onDelete, dragHandleProps }: Props) {
  const [showChart, setShowChart] = useState(false)

  const { data: quote } = useQuery({
    queryKey: ["quote", holding.symbol],
    queryFn: () => quoteApi.get(holding.symbol),
    refetchInterval: 1000 * 60,
  })

  const currentValue = quote ? quote.price * holding.quantity : null
  const gainLoss = quote ? (quote.price - holding.avgPrice) * holding.quantity : null
  const gainLossPct = quote
    ? ((quote.price - holding.avgPrice) / holding.avgPrice) * 100
    : null
  const isPositive = gainLoss !== null && gainLoss >= 0

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-3 gap-3">
        {/* 드래그 핸들 + 심볼 */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground select-none shrink-0"
          >
            ⠿
          </div>
          <div>
            <button
              className="font-bold text-sm tracking-wide hover:underline"
              onClick={() => setShowChart((v) => !v)}
            >
              {holding.symbol}
            </button>
            <p className="text-xs text-muted-foreground">
              {holding.quantity}주 · 평균 ${holding.avgPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* 시세 정보 */}
        <div className="flex items-center gap-4 shrink-0">
          {quote ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold">${quote.price.toFixed(2)}</p>
                <p className={`text-xs ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  {isPositive ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  ${currentValue?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
                <p className={`text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{gainLoss?.toFixed(0)}
                  {gainLossPct !== null && (
                    <span className="ml-1">({isPositive ? "+" : ""}{gainLossPct.toFixed(1)}%)</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">시세 조회 중...</p>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive text-xs px-2"
            onClick={() => onDelete(holding.id)}
          >
            삭제
          </Button>
        </div>
      </div>

      {/* 차트 토글 */}
      {showChart && (
        <div className="px-4 pb-4 border-t pt-3">
          <ErrorBoundary fallback={
            <p className="text-xs text-muted-foreground">차트를 불러오지 못했습니다</p>
          }>
            <PriceChart symbol={holding.symbol} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}
