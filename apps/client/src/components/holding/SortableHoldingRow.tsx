import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Holding } from "@/api/holding"
import HoldingRow from "./HoldingRow"

interface Props {
  holding: Holding
  onDelete: (id: string) => void
}

export default function SortableHoldingRow({ holding, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: holding.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <HoldingRow
      holding={holding}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
      rowRef={setNodeRef}
      rowStyle={style}
    />
  )
}
