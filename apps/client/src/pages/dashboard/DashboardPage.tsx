import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { dashboardApi } from "@/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/common/ErrorBoundary"

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: "green" | "red" | "default"
}) {
  const valueColor =
    accent === "green"
      ? "text-green-600 dark:text-green-400"
      : accent === "red"
      ? "text-red-500"
      : "text-foreground"

  return (
    <div className="bg-secondary/60 border rounded-xl p-5 space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  })

  const totalCost = data?.portfolios.reduce((sum, p) => sum + p.totalCost, 0) ?? 0

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  return (
    <div className="space-y-10">

      {/* 인사말 */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          안녕하세요, {user?.name}님
        </h1>
        <p className="text-muted-foreground mt-1">
          오늘의 포트폴리오 현황입니다
        </p>
      </div>

      {/* 요약 지표 */}
      <ErrorBoundary>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="포트폴리오"
            value={data?.portfolioCount ?? 0}
            sub="개 포트폴리오 운용 중"
          />
          <StatCard
            label="보유 종목"
            value={data?.totalHoldingCount ?? 0}
            sub="개 종목 보유 중"
          />
          <StatCard
            label="총 매수 금액"
            value={`$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            sub="매수 기준 평가"
            accent="default"
          />
        </div>
      </ErrorBoundary>

      {/* 포트폴리오 목록 */}
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">내 포트폴리오</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/portfolios")}>
              전체 보기 →
            </Button>
          </div>

          {!data || data.portfolios.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-3">
                <p className="text-4xl">📂</p>
                <p className="text-muted-foreground text-sm">
                  아직 포트폴리오가 없습니다
                </p>
                <Button size="sm" onClick={() => navigate("/portfolios")}>
                  포트폴리오 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {data.portfolios.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                  onClick={() => navigate(`/portfolios/${p.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        {p.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {p.holdingCount}개 종목
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.symbols.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-secondary px-2 py-0.5 rounded font-mono font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {p.symbols.length > 5 && (
                          <span className="text-xs text-muted-foreground px-1">
                            +{p.symbols.length - 5}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        매수 ${p.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  )
}
