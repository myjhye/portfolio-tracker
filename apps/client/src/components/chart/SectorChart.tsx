import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { type Holding } from "@/api/holding"
import { useQueries } from "@tanstack/react-query"
import { quoteApi } from "@/api/quote"

interface Props {
  holdings: Holding[]
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"]

export default function SectorChart({ holdings }: Props) {
  // 보유 종목별 현재가 병렬 조회
  const quoteResults = useQueries({
    queries: holdings.map((h) => ({
      queryKey: ["quote", h.symbol],
      queryFn: () => quoteApi.get(h.symbol),
      staleTime: 1000 * 60,
    })),
  })

  // 현재가 * 수량으로 각 종목 평가금액 계산
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
    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
      시세 로딩 중...
    </div>
  )

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-2">
      <PieChart width={300} height={240}>
        <Pie
          data={data}
          cx={140}
          cy={110}
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
            "평가금액",
          ]}
        />
        <Legend />
      </PieChart>
    </div>
  )
}
