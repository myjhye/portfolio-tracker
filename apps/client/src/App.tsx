import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { useThemeStore } from "./store/themeStore"
import ProtectedRoute from "./routes/ProtectedRoute"
import PublicRoute from "./routes/PublicRoute"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import PortfolioPage from "./pages/portfolio/PortfolioPage"
import PortfolioDetailPage from "./pages/portfolio/PortfolioDetailPage"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
})

export default function App() {
  const isDark = useThemeStore((s) => s.isDark)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/portfolios" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/portfolios/:id" element={<ProtectedRoute><PortfolioDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/portfolios" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
