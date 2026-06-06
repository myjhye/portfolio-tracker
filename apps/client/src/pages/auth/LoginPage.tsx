import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router-dom"
import { LoginSchema, type LoginInput } from "@portfolio-tracker/shared"
import { useAuthStore } from "../../store/authStore"
import api from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "12345678",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post("/auth/login", data)
      setUser(res.data)
      navigate("/dashboard")
    } catch {
      setError("root", { message: "이메일 또는 비밀번호가 틀렸습니다" })
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
            내 투자를<br />한눈에 관리하세요
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            실시간 시세, 포트폴리오 분석,<br />
            관심 종목까지 한 곳에서.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold text-white">실시간</p>
              <p className="text-zinc-500 text-sm">시세 업데이트</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">멀티</p>
              <p className="text-zinc-500 text-sm">포트폴리오</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">차트</p>
              <p className="text-zinc-500 text-sm">수익률 분석</p>
            </div>
          </div>
        </div>
        <p className="text-zinc-600 text-sm">© 2026 PortfolioTracker</p>
      </div>

      {/* 오른쪽 폼 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold">로그인</h2>
            <p className="text-muted-foreground text-sm mt-1">
              계정에 로그인하세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
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
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link to="/register" className="text-foreground font-medium underline underline-offset-4">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
