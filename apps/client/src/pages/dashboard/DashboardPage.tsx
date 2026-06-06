import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { dashboardApi } from "@/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/common/ErrorBoundary"

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-secondary rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
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

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">안녕하세요, {user?.name}님 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">포트폴리오 현황을 확인하세요</p>
      </div>

      <ErrorBoundary>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="포트폴리오" value={data?.portfolioCount ?? 0} />
          <StatCard label="보유 종목 수" value={data?.totalHoldingCount ?? 0} />
          <StatCard
            label="총 매수 금액"
            value={`$${data?.portfolios
              .reduce((sum, p) => sum + p.totalCost, 0)
              .toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 0}`}
          />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">내 포트폴리오</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/portfolios")}>
              전체 보기
            </Button>
          </div>

          {!data || data.portfolios.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                포트폴리오가 없습니다.{" "}
                <span
                  className="text-primary underline cursor-pointer"
                  onClick={() => navigate("/portfolios")}
                >
                  만들어보세요
                </span>
              </CardContent>
            </Card>
          ) : (
            data.portfolios.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/portfolios/${p.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant="outline">{p.holdingCount}개 종목</Badge>
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {p.symbols.slice(0, 5).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {p.symbols.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{p.symbols.length - 5}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      매수 ${p.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ErrorBoundary>
    </div>
  )
}
