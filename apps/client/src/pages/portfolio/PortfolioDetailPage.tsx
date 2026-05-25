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

// ── 종목 추가 입력값 검증 스키마 (프론트 로컬 정의) ──
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

// ── 포트폴리오 + 보유 종목 캐시 타입 (낙관적 업데이트에서 사용) ──
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

  // ── 포트폴리오 상세 조회 ──
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => portfolioApi.getOne(id!),
    enabled: !!id,
  })

  const holdings = portfolio?.holdings ?? []

  // ── 가상 스크롤: 종목이 많아도 화면에 보이는 것만 렌더링 ──
  const virtualizer = useVirtualizer({
    count: holdings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  })

  // ── 종목 추가 (낙관적 업데이트) ──
  // 흐름: onMutate → mutationFn → onSettled
  //   성공: 임시 데이터 → 서버 응답으로 교체
  //   실패: onError에서 이전 캐시로 롤백
  const addMutation = useMutation({
    mutationFn: (data: AddHoldingInput) => holdingApi.add(id!, data),

    // 1) 서버 요청 전: 캐시에 임시 데이터를 먼저 추가 → UI 즉시 반영
    onMutate: async (newHolding) => {
      // 진행 중인 쿼리 취소 (낙관적 데이터 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })

      // 롤백용 이전 캐시 저장
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])

      // 캐시에 임시 종목 추가 (temp id 부여)
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

    // 2) 실패 시: 저장해둔 이전 캐시로 롤백
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["portfolio", id], context.previous)
      }
    },

    // 3) 성공/실패 모두: 서버 데이터로 캐시 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] })
    },
  })

  // ── 종목 삭제 (낙관적 업데이트) ──
  // 흐름: 추가와 동일 (캐시에서 먼저 제거 → 실패 시 롤백)
  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => holdingApi.delete(id!, holdingId),

    // 1) 서버 요청 전: 캐시에서 해당 종목 즉시 제거
    onMutate: async (holdingId) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] })
      const previous = queryClient.getQueryData<PortfolioWithHoldings>(["portfolio", id])

      queryClient.setQueryData<PortfolioWithHoldings>(["portfolio", id], (old) => {
        if (!old) return old
        return { ...old, holdings: (old.holdings ?? []).filter((h) => h.id !== holdingId) }
      })

      return { previous }
    },

    // 2) 실패 시: 이전 캐시로 롤백
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["portfolio", id], context.previous)
      }
    },

    // 3) 성공/실패 모두: 서버 데이터로 캐시 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] })
    },
  })

  if (isLoading) return <div className="p-8 text-muted-foreground">불러오는 중...</div>
  if (!portfolio) return <div className="p-8 text-muted-foreground">포트폴리오를 찾을 수 없습니다</div>

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      {/* ── 헤더: 뒤로가기 + 포트폴리오 이름 ── */}
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
          {/* ── 종목 추가 폼 (토글) ── */}
          {showForm && (
            <HoldingForm
              onSubmit={async (data) => { await addMutation.mutateAsync(data) }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {holdings.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground">보유 종목이 없습니다.</p>
          )}

          {/* ── 가상 스크롤 목록: 보이는 행만 렌더링 ── */}
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
