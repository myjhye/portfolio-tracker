import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AddHoldingSchema, type AddHoldingInput } from "@portfolio-tracker/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onSubmit: (data: AddHoldingInput) => Promise<void>
  onCancel: () => void
}

export default function HoldingForm({ onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddHoldingInput>({
    resolver: zodResolver(AddHoldingSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-3 items-end">
      <div className="space-y-1">
        <Label>종목 심볼</Label>
        <Input {...register("symbol")} placeholder="AAPL" />
        {errors.symbol && <p className="text-xs text-destructive">{errors.symbol.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>수량</Label>
        <Input type="number" step="0.01" {...register("quantity", { valueAsNumber: true })} />
        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>평균단가</Label>
        <Input type="number" step="0.01" {...register("avgPrice", { valueAsNumber: true })} />
        {errors.avgPrice && <p className="text-xs text-destructive">{errors.avgPrice.message}</p>}
      </div>
      <div className="col-span-3 flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
        <Button type="submit" disabled={isSubmitting}>추가</Button>
      </div>
    </form>
  )
}
