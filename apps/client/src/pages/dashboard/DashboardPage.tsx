import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { dashboardApi } from "@/api/dashboard"
import ErrorBoundary from "@/components/common/ErrorBoundary"

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  })

  const totalCost = data?.portfolios.reduce((sum, p) => sum + p.totalCost, 0) ?? 0

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-md">
      불러오는 중...
    </div>
  )

  return (
    <div>
      {/* 인사말 */}
      <section className="mb-xl">
        <h1 className="text-headline-lg font-bold text-on-surface mb-base">
          안녕하세요, {user?.name}님
        </h1>
        <p className="text-body-md text-on-surface-variant">오늘의 포트폴리오 현황입니다</p>
      </section>

      {/* 요약 지표 */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
          {[
            {
              label: "포트폴리오",
              value: data?.portfolioCount ?? 0,
              sub: "개 포트폴리오 운용 중",
            },
            {
              label: "보유 종목",
              value: data?.totalHoldingCount ?? 0,
              sub: "개 종목 보유 중",
            },
            {
              label: "총 매수 금액",
              value: `$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              sub: "매수 기준 평가",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-caption text-on-surface-variant mb-xs">{stat.label}</p>
              <div className="flex items-baseline gap-xs mb-xs">
                <span className="text-display-lg font-bold text-primary font-mono">
                  {stat.value}
                </span>
              </div>
              <p className="text-caption text-on-primary-container">{stat.sub}</p>
            </div>
          ))}
        </section>
      </ErrorBoundary>

      {/* 포트폴리오 목록 */}
      <ErrorBoundary>
        <section>
          <div className="flex justify-between items-center mb-md">
            <h2 className="text-headline-md font-bold text-on-surface">내 포트폴리오</h2>
            <button
              onClick={() => navigate("/portfolios")}
              className="flex items-center gap-base text-label-mono text-secondary hover:underline transition-all"
            >
              전체 보기
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {!data || data.portfolios.length === 0 ? (
            <div className="bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-xl p-xl text-center space-y-md">
              <p className="text-4xl">📂</p>
              <p className="text-body-md text-on-surface-variant">아직 포트폴리오가 없습니다</p>
              <button
                onClick={() => navigate("/portfolios")}
                className="px-md py-xs bg-primary text-on-primary text-label-mono rounded-lg hover:scale-95 transition-transform"
              >
                포트폴리오 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-md">
              {data.portfolios.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/portfolios/${p.id}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-surface-container-low transition-colors group cursor-pointer"
                >
                  <div className="space-y-sm w-full md:w-auto">
                    <div className="flex items-center gap-md">
                      <div>
                        <h3 className="text-body-lg font-bold text-on-surface">{p.name}</h3>
                        {p.description && (
                          <p className="text-caption text-on-surface-variant">{p.description}</p>
                        )}
                      </div>
                      <span className="px-sm py-base bg-secondary text-white text-[11px] font-mono rounded-full uppercase tracking-wider">
                        {p.holdingCount}개 종목
                      </span>
                    </div>
                    <div className="flex gap-xs flex-wrap">
                      {p.symbols.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="px-sm py-base bg-surface-container-high border border-outline-variant/20 rounded-lg text-label-mono text-on-surface-variant group-hover:bg-surface-container-highest transition-colors"
                        >
                          {s}
                        </span>
                      ))}
                      {p.symbols.length > 5 && (
                        <span className="px-sm py-base text-caption text-on-surface-variant">
                          +{p.symbols.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-md md:mt-0 text-right">
                    <p className="text-caption text-on-surface-variant mb-base">매수 금액</p>
                    <p className="text-data-lg-mono font-bold text-primary">
                      ${p.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}

              {/* 벤토 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-xl">
                <div className="bg-tertiary-container text-on-tertiary rounded-xl p-lg relative overflow-hidden h-48 flex items-center">
                  <div className="z-10">
                    <h4 className="text-headline-md font-bold mb-xs">Market Trends</h4>
                    <p className="text-body-md text-on-tertiary-container">
                      Check real-time indices and upcoming earnings
                    </p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
                    <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      insights
                    </span>
                  </div>
                </div>
                <div className="bg-secondary text-white rounded-xl p-lg relative overflow-hidden h-48 flex items-center">
                  <div className="z-10">
                    <h4 className="text-headline-md font-bold mb-xs">실시간 시세</h4>
                    <p className="text-body-md opacity-80">
                      보유 종목 현재가를 1분마다 자동 갱신합니다
                    </p>
                    <div className="mt-md">
                      <span className="text-data-lg-mono font-bold">Live</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-4">
                    <span className="material-symbols-outlined text-[48px] animate-pulse">
                      rocket_launch
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </ErrorBoundary>
    </div>
  )
}
