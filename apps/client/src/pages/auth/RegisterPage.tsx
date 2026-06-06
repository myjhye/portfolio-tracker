import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router-dom"
import { RegisterSchema, type RegisterInput } from "@portfolio-tracker/shared"
import { useAuthStore } from "../../store/authStore"
import api from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post("/auth/register", data)
      setUser(res.data)
      navigate("/dashboard")
    } catch {
      setError("root", { message: "이미 사용중인 이메일입니다" })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12">
        <div>
          <span className="text-white font-semibold text-xl tracking-tight">
            📈 PortfolioTracker
          </span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            지금 시작하세요
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            무료로 가입하고<br />
            포트폴리오를 관리하세요.
          </p>
        </div>
        <p className="text-zinc-600 text-sm">© 2026 PortfolioTracker</p>
      </div>

      {/* 오른쪽 폼 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold">회원가입</h2>
            <p className="text-muted-foreground text-sm mt-1">
              새 계정을 만드세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="홍길동"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-foreground font-medium underline underline-offset-4">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
