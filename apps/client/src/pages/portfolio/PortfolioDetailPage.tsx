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
    <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-md">
      불러오는 중...
    </div>
  )
  if (!portfolio) return (
    <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-md">
      포트폴리오를 찾을 수 없습니다
    </div>
  )

  return (
    <div>
      {/* 뒤로가기 */}
      <div className="mb-lg">
        <button
          onClick={() => navigate("/portfolios")}
          className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors gap-xs group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span className="text-label-mono">Back to Portfolios</span>
        </button>
      </div>

      {/* 포트폴리오 헤더 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-body-md text-on-surface-variant mt-xs">{portfolio.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-label-mono text-on-surface-variant uppercase tracking-wider">
            Total Cost Basis
          </span>
          <div className="text-data-lg-mono font-bold text-primary">
            ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* 2컬럼 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

        {/* 왼쪽: 자산 배분 차트 */}
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="text-headline-md font-semibold">Asset Allocation</h2>
              <span className="material-symbols-outlined text-on-surface-variant">pie_chart</span>
            </div>
            <ErrorBoundary fallback={
              <div className="h-24 flex items-center justify-center text-caption text-on-surface-variant">
                차트를 불러오지 못했습니다
              </div>
            }>
              {holdings.length > 0
                ? <SectorChart holdings={holdings} />
                : <div className="h-32 flex items-center justify-center text-caption text-on-surface-variant">보유 종목이 없습니다</div>
              }
            </ErrorBoundary>
          </div>
        </div>

        {/* 오른쪽: 보유 종목 테이블 */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">

            {/* 테이블 헤더 */}
            <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
              <h2 className="text-headline-md font-semibold">
                Current Holdings ({holdings.length})
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-mono flex items-center gap-xs hover:opacity-90 transition-opacity active:scale-95 duration-100"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Holding
                </button>
              )}
            </div>

            {/* 종목 추가 폼 */}
            {showForm && (
              <div className="p-md border-b border-outline-variant/20 bg-surface-container-low/30">
                <HoldingForm
                  onSubmit={async (data) => { await addMutation.mutateAsync(data) }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* 테이블 */}
            {holdings.length === 0 && !showForm ? (
              <div className="py-16 text-center text-on-surface-variant text-body-md">
                보유 종목이 없습니다
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest text-label-mono text-on-surface-variant uppercase text-[12px] border-b border-outline-variant/20">
                      <th className="px-md py-sm font-medium w-12"></th>
                      <th className="px-md py-sm font-medium">Asset</th>
                      <th className="px-md py-sm font-medium">Shares / Avg</th>
                      <th className="px-md py-sm font-medium text-right">Price / Change</th>
                      <th className="px-md py-sm font-medium text-right">Market Value</th>
                      <th className="px-md py-sm font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
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
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
