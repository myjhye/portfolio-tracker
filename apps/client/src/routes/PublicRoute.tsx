import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

// ── 비인증 전용 라우트 가드: 이미 로그인된 유저는 대시보드로 리다이렉트 ──
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
