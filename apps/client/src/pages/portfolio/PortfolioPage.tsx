import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { portfolioApi, type Portfolio } from "@/api/portfolio"
import { type CreatePortfolioInput } from "@portfolio-tracker/shared"
import PortfolioForm from "@/components/portfolio/PortfolioForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  if (isLoading) return <div className="p-8 text-muted-foreground">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">내 포트폴리오</h1>
        {mode === "idle" && (
          <Button onClick={() => setMode("create")}>+ 새 포트폴리오</Button>
        )}
      </div>

      {mode === "create" && (
        <Card>
          <CardHeader><CardTitle>새 포트폴리오</CardTitle></CardHeader>
          <CardContent>
            <PortfolioForm
              onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
              onCancel={() => setMode("idle")}
              submitLabel="생성"
            />
          </CardContent>
        </Card>
      )}

      {portfolios.length === 0 && mode === "idle" && (
        <p className="text-muted-foreground text-sm">포트폴리오가 없습니다. 새로 만들어보세요.</p>
      )}

      <div className="space-y-3">
        {portfolios.map((p) => (
          <Card key={p.id}>
            {mode !== "idle" && typeof mode === "object" && mode.portfolio.id === p.id ? (
              <CardContent className="pt-6">
                <PortfolioForm
                  defaultValues={{ name: p.name, description: p.description }}
                  onSubmit={async (data) => { await updateMutation.mutateAsync({ id: p.id, data }) }}
                  onCancel={() => setMode("idle")}
                  submitLabel="수정"
                />
              </CardContent>
            ) : (
              <CardContent className="pt-6 flex items-start justify-between">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => navigate(`/portfolios/${p.id}`)}
                >
                  <p className="font-medium">{p.name}</p>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  )}
                  <Badge variant="outline" className="mt-2 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMode({ type: "edit", portfolio: p })}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
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
