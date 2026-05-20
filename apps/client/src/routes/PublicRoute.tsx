import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
