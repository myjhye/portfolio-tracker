import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreatePortfolioSchema, type CreatePortfolioInput } from "@portfolio-tracker/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  defaultValues?: Partial<CreatePortfolioInput>
  onSubmit: (data: CreatePortfolioInput) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export default function PortfolioForm({ defaultValues, onSubmit, onCancel, submitLabel = "저장" }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePortfolioInput>({
    resolver: zodResolver(CreatePortfolioSchema) as Resolver<CreatePortfolioInput>,
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>포트폴리오 이름</Label>
        <Input {...register("name")} placeholder="내 포트폴리오" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>설명 (선택)</Label>
        <Input {...register("description")} placeholder="설명을 입력하세요" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}
