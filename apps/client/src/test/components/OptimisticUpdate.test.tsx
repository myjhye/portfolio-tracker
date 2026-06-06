// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Routes, Route } from "react-router-dom"

// holdingApi 모킹
vi.mock("@/api/holding", () => ({
  holdingApi: {
    add: vi.fn().mockResolvedValue({ id: "real-id", symbol: "AAPL", quantity: 10, avgPrice: 180, order: 0, portfolioId: "p1" }),
    delete: vi.fn().mockResolvedValue({}),
    reorder: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock("@/api/portfolio", () => ({
  portfolioApi: {
    getOne: vi.fn().mockResolvedValue({
      id: "p1", name: "테스트 포트폴리오", holdings: [],
    }),
  },
}))

vi.mock("@/api/quote", () => ({
  quoteApi: { get: vi.fn().mockResolvedValue(null) },
  historyApi: { get: vi.fn().mockResolvedValue([]) },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/portfolios/p1"]}>
        <Routes>
          <Route path="/portfolios/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe("낙관적 업데이트", () => {
  beforeEach(() => vi.clearAllMocks())

  it("종목 추가 시 API 응답 전에 UI에 즉시 반영된다", async () => {
    const { holdingApi } = await import("@/api/holding")

    // API 응답을 지연시켜서 낙관적 업데이트 확인
    vi.mocked(holdingApi.add).mockImplementation(
      () => new Promise((resolve) =>
        setTimeout(() => resolve({
          id: "real-id", symbol: "AAPL", quantity: 10,
          avgPrice: 180, order: 0, portfolioId: "p1",
        }), 500)
      )
    )

    const { default: PortfolioDetailPage } = await import("@/pages/portfolio/PortfolioDetailPage")
    const Wrapper = createWrapper()

    render(<Wrapper><PortfolioDetailPage /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByText("Add Holding")).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText("Add Holding"))

    await userEvent.type(screen.getByPlaceholderText("AAPL"), "AAPL")
    await userEvent.type(screen.getAllByRole("spinbutton")[0], "10")
    await userEvent.type(screen.getAllByRole("spinbutton")[1], "180")
    await userEvent.click(screen.getByRole("button", { name: "추가" }))

    // API 응답 전에 UI에 이미 AAPL이 표시됨
    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument()
    })
  })
})
