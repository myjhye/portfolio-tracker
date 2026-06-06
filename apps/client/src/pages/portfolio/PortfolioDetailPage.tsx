import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable"
import { z } from "zod"
import { portfolioApi } from "@/api/portfolio"
import { holdingApi, type Holding } from "@/api/holding"
import HoldingForm from "@/components/holding/HoldingForm"
import SortableHoldingRow from "@/components/holding/SortableHoldingRow"
import SectorChart from "@/components/chart/SectorChart"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AddHoldingSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
})
type AddHoldingInput = z.infer<typeof AddHoldingSchema> & {
  symbol: string; quantity: number; avgPrice: number
}

interface PortfolioWithHoldings {
  id: string; name: string; description?: string; holdings: Holding[]
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => portfolioApi.getOne(id!),
    enabled: !!id,
  })

  const holdings = portfolio?.holdings ?? []

  const totalCost = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0)

  const addMutation = useMutation({
    mutationFn: (data: AddHoldingInput) => holdingApi.add(id!, data),
    onMutate: async (newHolding) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])
      queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
        if (!old) return old
        const optimistic: Holding = {
          id: `temp-${Date.now()}`,
          symbol: newHolding.symbol.toUpperCase(),
          quantity: newHolding.quantity,
          avgPrice: newHolding.avgPrice,
          order: old.holdings.length,
          portfolioId: id!,
        }
        return { ...old, holdings: [...old.holdings, optimistic] }
      })
      setShowForm(false)
      return { previous }
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(["portfolio", id], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["portfolio", id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => holdingApi.delete(id!, holdingId),
    onMutate: async (holdingId) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])
      queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
        if (!old) return old
        return { ...old, holdings: old.holdings.filter((h) => h.id !== holdingId) }
      })
      return { previous }
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(["portfolio", id], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["portfolio", id] }),
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => holdingApi.reorder(id!, ids),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = holdings.findIndex((h) => h.id === active.id)
    const newIndex = holdings.findIndex((h) => h.id === over.id)
    const reordered = arrayMove(holdings, oldIndex, newIndex)
    queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
      if (!old) return old
      return { ...old, holdings: reordered }
    })
    reorderMutation.mutate(reordered.map((h) => h.id))
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )
  if (!portfolio) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
      포트폴리오를 찾을 수 없습니다
    </div>
  )

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div className="border-b pb-5">
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="sm" onClick={() => navigate("/portfolios")}
            className="text-muted-foreground -ml-2">
            ← 목록
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{portfolio.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">총 매수금액</p>
            <p className="text-xl font-bold">
              ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* 종목 비중 차트 */}
      {holdings.length > 0 && (
        <ErrorBoundary fallback={
          <div className="h-24 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
            차트를 불러오지 못했습니다
          </div>
        }>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                종목 비중
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-4">
              <SectorChart holdings={holdings} />
            </CardContent>
          </Card>
        </ErrorBoundary>
      )}

      {/* 보유 종목 */}
      <ErrorBoundary fallback={
        <div className="h-24 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
          종목 목록을 불러오지 못했습니다
        </div>
      }>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              보유 종목 ({holdings.length})
            </CardTitle>
            {!showForm && (
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                + 종목 추가
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {showForm && (
              <div className="border rounded-lg p-4 bg-secondary/30">
                <HoldingForm
                  onSubmit={async (data) => { await addMutation.mutateAsync(data) }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {holdings.length === 0 && !showForm && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                보유 종목이 없습니다
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={holdings.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                {holdings.map((holding) => (
                  <SortableHoldingRow
                    key={holding.id}
                    holding={holding}
                    onDelete={(holdingId) => deleteMutation.mutate(holdingId)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  )
}
