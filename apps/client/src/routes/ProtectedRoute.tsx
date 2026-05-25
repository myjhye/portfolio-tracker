import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

// ── 인증 필요 라우트 가드: 미로그인 시 로그인 페이지로 리다이렉트 ──
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
