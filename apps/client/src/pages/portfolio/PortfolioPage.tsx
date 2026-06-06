import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { portfolioApi, type Portfolio } from "@/api/portfolio"
import { type CreatePortfolioInput } from "@portfolio-tracker/shared"
import PortfolioForm from "@/components/portfolio/PortfolioForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 포트폴리오</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {portfolios.length}개 포트폴리오
          </p>
        </div>
        {mode === "idle" && (
          <Button onClick={() => setMode("create")}>
            + 새 포트폴리오
          </Button>
        )}
      </div>

      {/* 생성 폼 */}
      {mode === "create" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">새 포트폴리오</p>
            <PortfolioForm
              onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
              onCancel={() => setMode("idle")}
              submitLabel="생성"
            />
          </CardContent>
        </Card>
      )}

      {/* 빈 상태 */}
      {portfolios.length === 0 && mode === "idle" && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <p className="text-4xl">📂</p>
            <p className="text-muted-foreground text-sm">
              아직 포트폴리오가 없습니다
            </p>
            <Button size="sm" onClick={() => setMode("create")}>
              첫 포트폴리오 만들기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 포트폴리오 목록 */}
      <div className="space-y-3">
        {portfolios.map((p) => (
          <Card
            key={p.id}
            className="hover:shadow-sm hover:border-primary/30 transition-all"
          >
            {typeof mode === "object" && mode.portfolio.id === p.id ? (
              <CardContent className="pt-6">
                <PortfolioForm
                  defaultValues={{ name: p.name, description: p.description }}
                  onSubmit={async (data) => {
                    await updateMutation.mutateAsync({ id: p.id, data })
                  }}
                  onCancel={() => setMode("idle")}
                  submitLabel="수정"
                />
              </CardContent>
            ) : (
              <CardContent className="py-4 flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => navigate(`/portfolios/${p.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{p.name}</p>
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {p.description}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 text-xs font-normal">
                    {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                  </Badge>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMode({ type: "edit", portfolio: p })}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(p.id)}
                  >
                    삭제
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
