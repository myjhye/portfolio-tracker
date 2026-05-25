import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts"
import { historyApi } from "@/api/quote"
import { Button } from "@/components/ui/button"

type Period = "1W" | "1M" | "3M"
const PERIOD_DAYS: Record<Period, number> = { "1W": 7, "1M": 30, "3M": 90 }

interface Props { symbol: string }

// ── 종목 가격 라인차트 ──
// 기간별(1W/1M/3M) 일별 종가를 표시하고, 시작가 대비 색상(녹/적) 변경
export default function PriceChart({ symbol }: Props) {
  const [period, setPeriod] = useState<Period>("1M")

  const { data: history, isLoading } = useQuery({
    queryKey: ["history", symbol],
    queryFn: () => historyApi.get(symbol),
  })

  if (isLoading) return <div className="h-48 flex items-center justify-center text-sm">차트 로딩 중...</div>
  if (!history || history.length === 0) return null

  // 유효한 row만 필터링 (date 존재 + close가 finite number)
  const cleaned = history.filter(
    (d) => d?.date && typeof d.close === "number" && Number.isFinite(d.close)
  )
  const sliced = cleaned.slice(-PERIOD_DAYS[period])
  if (sliced.length === 0) return <div className="h-48 flex items-center justify-center text-sm">데이터 없음</div>

  // 인덱스 기반 X축 매핑 (카테고리 축 추론 버그 우회)
  const chartData = sliced.map((d, i) => ({ ...d, idx: i }))

  const firstPrice = sliced[0].close
  const lastPrice = sliced[sliced.length - 1].close
  const isPositive = lastPrice >= firstPrice
  const color = isPositive ? "#16a34a" : "#dc2626"

  return (
    <div className="space-y-3">
      {/* 기간 선택 버튼 */}
      <div className="flex gap-2">
        {(["1W", "1M", "3M"] as Period[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      <LineChart width={600} height={200} data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="idx"
          type="number"
          domain={[0, chartData.length - 1]}
          tick={{ fontSize: 11, fill: "#888" }}
          tickFormatter={(i) => {
            const d = chartData[i]?.date
            return typeof d === "string" ? d.slice(5) : ""
          }}
        />
        <YAxis
          type="number"
          domain={["auto", "auto"]}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={55}
        />
        <Tooltip
          formatter={(v: number) => [`$${v.toFixed(2)}`, "종가"]}
          labelFormatter={(i) => chartData[i as number]?.date ?? ""}
        />
        {/* 시작가 기준선 (유효할 때만 렌더링) */}
        {Number.isFinite(firstPrice) && firstPrice > 0 && (
          <ReferenceLine y={firstPrice} stroke="#888" strokeDasharray="3 3" />
        )}
        <Line
          type="monotone"
          dataKey="close"
          stroke={color}
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  )
}
