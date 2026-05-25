import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Holding } from "@/api/holding"
import HoldingRow from "./HoldingRow"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
}

// ── 드래그 정렬 가능한 종목 행 래퍼 ──
// HoldingRow를 감싸서 dnd-kit의 정렬 기능을 부여
export default function SortableHoldingRow({ holding, onDelete }: Props) {
  // useSortable: 드래그 위치 추적 + 접근성(키보드) 지원
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: holding.id })

  // 드래그 중: 반투명 + 최상위 레이어로 올림
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* 드래그 핸들 props를 HoldingRow의 ⠿ 아이콘에 전달 */}
      <HoldingRow
        holding={holding}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
