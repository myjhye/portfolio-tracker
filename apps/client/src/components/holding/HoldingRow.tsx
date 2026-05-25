import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"
import { type Holding } from "@/api/holding"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PriceChart from "@/components/chart/PriceChart"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

// ── 보유 종목 한 행 ──
// 좌측: 드래그 핸들 + 심볼(클릭 시 차트 토글) + 수량/평균단가
// 우측: 현재가 + 손익 + 등락률 + 평가금액 + 삭제 버튼
export default function HoldingRow({ holding, onDelete, dragHandleProps }: Props) {
  const [showChart, setShowChart] = useState(false)

  // 1분마다 시세 자동 갱신
  const { data: quote } = useQuery({
    queryKey: ["quote", holding.symbol],
    queryFn: () => quoteApi.get(holding.symbol),
    refetchInterval: 1000 * 60,
  })

  // 평가금액 = 현재가 × 수량
  const currentValue = quote ? quote.price * holding.quantity : null
  // 손익 = (현재가 - 평균단가) × 수량
  const gainLoss = quote ? (quote.price - holding.avgPrice) * holding.quantity : null
  const isPositive = gainLoss !== null && gainLoss >= 0

  return (
    <div className="border-b last:border-0">
      <div className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          {/* ⠿ 드래그 핸들: SortableHoldingRow에서 전달받은 이벤트 바인딩 */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground px-1 select-none"
          >
            ⠿
          </div>
          {/* 심볼 클릭 시 가격 차트 토글 */}
          <span
            className="font-medium w-16 cursor-pointer hover:underline"
            onClick={() => setShowChart((v) => !v)}
          >
            {holding.symbol}
          </span>
          <span className="text-sm text-muted-foreground">
            {holding.quantity}주 · 평균 ${holding.avgPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {quote ? (
            <>
              <span className="font-medium">${quote.price.toFixed(2)}</span>
              <Badge variant={isPositive ? "default" : "destructive"}>
                {isPositive ? "+" : ""}{gainLoss?.toFixed(2)}
              </Badge>
              <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-500"}`}>
                {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">로딩 중...</span>
          )}
          {currentValue && (
            <span className="text-sm font-medium w-24 text-right">
              ${currentValue.toFixed(2)}
            </span>
          )}
          <Button size="sm" variant="destructive" onClick={() => onDelete(holding.id)}>삭제</Button>
        </div>
      </div>

      {/* 차트 영역: 심볼 클릭 시 펼침 */}
      {showChart && (
        <div className="px-4 pb-4">
          <PriceChart symbol={holding.symbol} />
        </div>
      )}
    </div>
  )
}
