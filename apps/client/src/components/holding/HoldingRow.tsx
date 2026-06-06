import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"
import { type Holding } from "@/api/holding"
import PriceChart from "@/components/chart/PriceChart"
import ErrorBoundary from "@/components/common/ErrorBoundary"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  rowRef?: (node: HTMLTableRowElement | null) => void
  rowStyle?: React.CSSProperties
}

export default function HoldingRow({ holding, onDelete, dragHandleProps, rowRef, rowStyle }: Props) {
  const [showChart, setShowChart] = useState(false)

  const { data: quote } = useQuery({
    queryKey: ["quote", holding.symbol],
    queryFn: () => quoteApi.get(holding.symbol),
    refetchInterval: 1000 * 60,
  })

  const currentValue = quote ? quote.price * holding.quantity : null
  const gainLossPct = quote
    ? ((quote.price - holding.avgPrice) / holding.avgPrice) * 100
    : null
  const isPositive = gainLossPct !== null && gainLossPct >= 0

  return (
    <>
      <tr
        ref={rowRef}
        style={rowStyle}
        className="hover:bg-surface-container-low transition-colors group cursor-pointer"
      >
        {/* 드래그 핸들 */}
        <td className="px-md py-md">
          <div
            {...dragHandleProps}
            className="drag-handle cursor-grab active:cursor-grabbing text-on-surface-variant opacity-30 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
          </div>
        </td>

        {/* 종목명 */}
        <td className="px-md py-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-body-md">
              {holding.symbol[0]}
            </div>
            <div>
              <button
                className="text-body-md font-bold text-primary hover:underline"
                onClick={() => setShowChart((v) => !v)}
              >
                {holding.symbol}
              </button>
              <div className="text-caption text-on-surface-variant">
                {holding.quantity}주
              </div>
            </div>
          </div>
        </td>

        {/* 수량 / 평균단가 */}
        <td className="px-md py-md">
          <div className="text-data-lg-mono text-[14px]">{holding.quantity.toFixed(2)}</div>
          <div className="text-caption text-on-surface-variant">@ ${holding.avgPrice.toFixed(2)}</div>
        </td>

        {/* 현재가 / 등락률 */}
        <td className="px-md py-md text-right">
          {quote ? (
            <>
              <div className="text-data-lg-mono text-[14px]">${quote.price.toFixed(2)}</div>
              <div className={`text-label-mono text-[12px] flex items-center justify-end ${isPositive ? "text-[#1a7f37]" : "text-error"}`}>
                <span className="material-symbols-outlined text-[14px]">
                  {isPositive ? "arrow_drop_up" : "arrow_drop_down"}
                </span>
                {Math.abs(quote.changePercent).toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="text-caption text-on-surface-variant">조회 중...</div>
          )}
        </td>

        {/* 평가금액 / 손익 */}
        <td className="px-md py-md text-right">
          {currentValue !== null ? (
            <>
              <div className="text-data-lg-mono text-[16px] text-primary">
                ${currentValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
              {gainLossPct !== null && (
                <div className={`text-label-mono text-[12px] ${isPositive ? "text-[#1a7f37]" : "text-error"}`}>
                  {isPositive ? "+" : ""}{gainLossPct.toFixed(1)}% Total
                </div>
              )}
            </>
          ) : (
            <div className="text-caption text-on-surface-variant">-</div>
          )}
        </td>

        {/* 삭제 버튼 */}
        <td className="px-md py-md text-center">
          <button
            onClick={() => onDelete(holding.id)}
            className="p-xs hover:bg-error-container text-error rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete_outline</span>
          </button>
        </td>
      </tr>

      {/* 차트 토글 행 */}
      {showChart && (
        <tr>
          <td colSpan={6} className="px-md pb-md border-b border-outline-variant/10">
            <ErrorBoundary fallback={
              <p className="text-caption text-on-surface-variant py-2">차트를 불러오지 못했습니다</p>
            }>
              <PriceChart symbol={holding.symbol} />
            </ErrorBoundary>
          </td>
        </tr>
      )}
    </>
  )
}
