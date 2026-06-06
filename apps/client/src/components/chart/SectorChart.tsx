import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { type Holding } from "@/api/holding"
import { useQueries } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"

interface Props {
  holdings: Holding[]
}

const COLORS = ["#4b41e1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"]

export default function SectorChart({ holdings }: Props) {
  const quoteResults = useQueries({
    queries: holdings.map((h) => ({
      queryKey: ["quote", h.symbol],
      queryFn: () => quoteApi.get(h.symbol),
      staleTime: 1000 * 60 * 60 * 24,
    })),
  })

  const data = holdings
    .map((h, i) => {
      const price = quoteResults[i]?.data?.price
      if (!price) return null
      return {
        name: h.symbol,
        value: Math.round(price * h.quantity * 100) / 100,
      }
    })
    .filter(Boolean) as { name: string; value: number }[]

  if (data.length === 0) return (
    <div className="h-48 flex items-center justify-center text-caption text-on-surface-variant">
      시세 로딩 중...
    </div>
  )

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-md">
      {/* 파이차트 */}
      <div className="flex justify-center">
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            cx={105}
            cy={105}
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [
              `$${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`,
              "평가금액"
            ]}
          />
        </PieChart>
      </div>

      {/* 커스텀 범례 */}
      <div className="space-y-xs px-xs">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-label-mono text-on-surface">{d.name}</span>
            </div>
            <div className="flex items-center gap-md">
              <span className="text-caption text-on-surface-variant">
                ${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-label-mono text-on-surface w-12 text-right">
                {((d.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
