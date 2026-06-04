// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "@/routes/ProtectedRoute"

// 로그인 상태 제어용 모킹
const mockUser = vi.fn()
vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: { user: ReturnType<typeof mockUser>; setUser: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ user: mockUser(), setUser: vi.fn(), logout: vi.fn() }),
}))

describe("ProtectedRoute", () => {
  it("비로그인 상태면 /login으로 리다이렉트된다", () => {
    mockUser.mockReturnValue(null)
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>대시보드</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText("로그인 페이지")).toBeInTheDocument()
    expect(screen.queryByText("대시보드")).not.toBeInTheDocument()
  })

  it("로그인 상태면 자식 컴포넌트가 렌더된다", () => {
    mockUser.mockReturnValue({ id: "1", email: "test@test.com", name: "Jay" })
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>대시보드</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText("대시보드")).toBeInTheDocument()
    expect(screen.queryByText("로그인 페이지")).not.toBeInTheDocument()
  })
})
