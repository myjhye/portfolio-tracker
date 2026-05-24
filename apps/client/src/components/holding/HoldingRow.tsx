import { useQuery } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"
import { type Holding } from "@/api/holding"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
}

export default function HoldingRow({ holding, onDelete }: Props) {
  const { data: quote } = useQuery({
    queryKey: ["quote", holding.symbol],
    queryFn: () => quoteApi.get(holding.symbol),
    refetchInterval: 1000 * 60,
  })

  const currentValue = quote ? quote.price * holding.quantity : null
  const gainLoss = quote ? (quote.price - holding.avgPrice) * holding.quantity : null
  const isPositive = gainLoss !== null && gainLoss >= 0

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-0">
      <div className="flex items-center gap-4">
        <span className="font-medium w-16">{holding.symbol}</span>
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
  )
}
