import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ProtectedRoute from "./routes/ProtectedRoute"
import PublicRoute from "./routes/PublicRoute"
import Layout from "./components/layout/Layout"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import PortfolioPage from "./pages/portfolio/PortfolioPage"
import PortfolioDetailPage from "./pages/portfolio/PortfolioDetailPage"
import WatchlistPage from "./pages/watchlist/WatchlistPage"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/portfolios" element={
            <ProtectedRoute>
              <Layout><PortfolioPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/portfolios/:id" element={
            <ProtectedRoute>
              <Layout><PortfolioDetailPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <Layout><WatchlistPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
