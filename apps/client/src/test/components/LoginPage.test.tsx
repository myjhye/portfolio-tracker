// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import LoginPage from "@/pages/auth/LoginPage"

// api 모듈 모킹
vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
  },
}))

// zustand store 모킹
vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: { user: null; setUser: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ user: null, setUser: vi.fn(), logout: vi.fn() }),
}))

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe("LoginPage", () => {
  it("이메일/비밀번호 인풋과 로그인 버튼이 렌더된다", () => {
    renderLoginPage()
    expect(screen.getByLabelText("이메일")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument()
  })

  it("이메일 형식이 틀리면 에러 메시지가 표시된다", async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText("이메일"), "invalid-email")
    await userEvent.type(screen.getByLabelText("비밀번호"), "12345678")
    fireEvent.submit(screen.getByRole("button", { name: "로그인" }).closest("form")!)
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it("비밀번호가 비어있으면 에러 메시지가 표시된다", async () => {
    renderLoginPage()
    await userEvent.type(screen.getByLabelText("이메일"), "test@test.com")
    fireEvent.submit(screen.getByRole("button", { name: "로그인" }).closest("form")!)
    await waitFor(() => {
      expect(screen.getByText(/at least/i)).toBeInTheDocument()
    })
  })
})
