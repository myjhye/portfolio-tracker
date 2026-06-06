import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { portfolioApi, type Portfolio } from "@/api/portfolio"
import { type CreatePortfolioInput } from "@portfolio-tracker/shared"
import PortfolioForm from "@/components/portfolio/PortfolioForm"

type Mode = "idle" | "create" | { type: "edit"; portfolio: Portfolio }

export default function PortfolioPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>("idle")

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: portfolioApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: portfolioApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] })
      setMode("idle")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePortfolioInput> }) =>
      portfolioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] })
      setMode("idle")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: portfolioApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-md">
      불러오는 중...
    </div>
  )

  return (
    <div>
      {/* 헤더 */}
      <section className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="text-headline-lg font-bold text-primary mb-base">내 포트폴리오</h1>
          <p className="text-body-md text-on-surface-variant">{portfolios.length}개 포트폴리오</p>
        </div>
        {mode === "idle" && (
          <button
            onClick={() => setMode("create")}
            className="inline-flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-xl text-body-md hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add</span>
            새 포트폴리오
          </button>
        )}
      </section>

      {/* 생성 폼 */}
      {mode === "create" && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm mb-md">
          <p className="text-label-mono text-on-surface-variant uppercase tracking-wider mb-md">
            새 포트폴리오
          </p>
          <PortfolioForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync({
                name: data.name,
                description: data.description,
              })
            }}
            onCancel={() => setMode("idle")}
            submitLabel="생성"
          />
        </div>
      )}

      {/* 빈 상태 */}
      {portfolios.length === 0 && mode === "idle" && (
        <div className="flex flex-col items-center justify-center py-[100px] bg-surface-container-low/50 border-2 border-dashed border-outline-variant/30 rounded-xl text-center">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">
              folder_open
            </span>
          </div>
          <h3 className="text-headline-md font-semibold text-primary mb-xs">
            아직 포트폴리오가 없습니다
          </h3>
          <p className="text-body-md text-on-surface-variant mb-lg">
            첫 번째 포트폴리오를 만들어 투자를 관리해 보세요
          </p>
          <button
            onClick={() => setMode("create")}
            className="bg-primary text-on-primary px-lg py-sm rounded-xl text-body-md hover:opacity-90 transition-all"
          >
            + 첫 포트폴리오 만들기
          </button>
        </div>
      )}

      {/* 포트폴리오 목록 */}
      <div className="grid grid-cols-1 gap-md">
        {portfolios.map((p) => (
          <div key={p.id}>
            {typeof mode === "object" && mode.portfolio.id === p.id ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm">
                <PortfolioForm
                  defaultValues={{ name: p.name, description: p.description }}
                  onSubmit={async (data) => {
                    await updateMutation.mutateAsync({ id: p.id, data })
                  }}
                  onCancel={() => setMode("idle")}
                  submitLabel="수정"
                />
              </div>
            ) : (
              <div
                className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/portfolios/${p.id}`)}
              >
                {/* hover accent 라인 */}
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />

                <div className="flex flex-col md:flex-row justify-between gap-md">
                  {/* 왼쪽: 포트폴리오 정보 */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-sm mb-base">
                      <h3 className="text-headline-md font-semibold text-primary">{p.name}</h3>
                      <span className="bg-surface-container-high text-on-surface-variant px-sm py-[2px] rounded-full text-caption">
                        {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-body-md text-on-surface-variant mb-md line-clamp-1">
                        {p.description}
                      </p>
                    )}

                    {/* 종목 심볼 배지 */}
                    {p.symbols && p.symbols.length > 0 && (
                      <div className="flex items-center gap-xs flex-wrap mt-sm">
                        {p.symbols.slice(0, 6).map((s) => (
                          <span
                            key={s}
                            className="px-sm py-[2px] bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-label-mono text-[12px] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                        {p.symbols.length > 6 && (
                          <span className="text-caption text-on-surface-variant">
                            +{p.symbols.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 종목 수 + 버튼 */}
                  <div className="flex flex-col items-end justify-between gap-md shrink-0">
                    {/* 종목 수 */}
                    <div className="text-right">
                      <p className="text-caption text-on-surface-variant uppercase tracking-wider">
                        보유 종목
                      </p>
                      <p className="text-data-lg-mono font-bold text-primary">
                        {p.holdingCount ?? 0}
                        <span className="text-body-md text-on-surface-variant font-normal ml-xs">종목</span>
                      </p>
                    </div>

                    {/* 수정/삭제 버튼 */}
                    <div
                      className="flex items-center gap-base z-20 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setMode({ type: "edit", portfolio: p })}
                        className="flex items-center gap-base text-on-surface-variant hover:text-secondary px-sm py-base rounded-lg hover:bg-secondary/5 transition-all text-label-mono"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        수정
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p.id)}
                        className="flex items-center gap-base text-error/80 hover:text-error px-sm py-base rounded-lg hover:bg-error/5 transition-all text-label-mono"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
