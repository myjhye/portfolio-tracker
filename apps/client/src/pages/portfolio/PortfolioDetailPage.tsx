import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import { portfolioApi } from "@/api/portfolio"
import { holdingApi, type Holding } from "@/api/holding"
import { z } from "zod"
import HoldingForm from "@/components/holding/HoldingForm"
import HoldingRow from "@/components/holding/HoldingRow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AddHoldingSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
})
type AddHoldingInput = z.infer<typeof AddHoldingSchema> & {
  symbol: string
  quantity: number
  avgPrice: number
}

interface PortfolioWithHoldings {
  id: string
  name: string
  description?: string
  holdings: Holding[]
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => portfolioApi.getOne(id!),
    enabled: !!id,
  })

  const holdings = portfolio?.holdings ?? []

  const virtualizer = useVirtualizer({
    count: holdings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  })

  const addMutation = useMutation({
    mutationFn: (data: AddHoldingInput) => holdingApi.add(id!, data),
    onMutate: async (newHolding) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])

      queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
        if (!old) return old
        const existing = old.holdings ?? []
        const optimistic: Holding = {
          id: `temp-${Date.now()}`,
          symbol: newHolding.symbol.toUpperCase(),
          quantity: newHolding.quantity,
          avgPrice: newHolding.avgPrice,
          order: existing.length,
          portfolioId: id!,
        }
        return { ...old, holdings: [...existing, optimistic] }
      })

      setShowForm(false)
      return { previous }
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["portfolio", id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => holdingApi.delete(id!, holdingId),
    onMutate: async (holdingId) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])

      queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
        if (!old) return old
        return { ...old, holdings: (old.holdings ?? []).filter((h) => h.id !== holdingId) }
      })

      return { previous }
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["portfolio", id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] })
    },
  })

  if (isLoading) return <div className="p-8 text-muted-foreground">불러오는 중...</div>
  if (!portfolio) return <div className="p-8 text-muted-foreground">포트폴리오를 찾을 수 없습니다</div>

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/portfolios")}>← 목록</Button>
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>

      {portfolio.description && (
        <p className="text-muted-foreground">{portfolio.description}</p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>보유 종목</CardTitle>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>+ 종목 추가</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <HoldingForm
              onSubmit={async (data) => { await addMutation.mutateAsync(data) }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {holdings.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground">보유 종목이 없습니다.</p>
          )}

          <div ref={parentRef} style={{ maxHeight: "480px", overflow: "auto" }}>
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((vItem) => (
                <div
                  key={vItem.key}
                  style={{
                    position: "absolute",
                    top: vItem.start,
                    width: "100%",
                    height: vItem.size,
                  }}
                >
                  <HoldingRow
                    holding={holdings[vItem.index]}
                    onDelete={(holdingId) => deleteMutation.mutate(holdingId)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
