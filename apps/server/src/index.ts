/**
 * Portfolio Tracker API 서버 진입점
 *
 * Fastify 앱을 생성하고 플러그인(CORS, JWT, Cookie)과
 * 도메인별 라우트(auth, portfolio, holding, watchlist, quotes, dashboard)를 등록합니다.
 */
import Fastify from "fastify"
import { registerPlugins } from "./plugins/index"
import { authRoutes } from "./modules/auth/auth.route"
import { portfolioRoutes } from "./modules/portfolio/portfolio.route"
import { holdingRoutes } from "./modules/holding/holding.route"
import { watchlistRoutes } from "./modules/watchlist/watchlist.route"
import { quotesRoutes } from "./modules/quotes/quotes.route"
import { dashboardRoutes } from "./modules/dashboard/dashboard.route"

const app = Fastify({ logger: true })

const start = async () => {
  // CORS, 쿠키, JWT 등 공통 플러그인
  await registerPlugins(app)

  // API 라우트 등록 (순서는 경로 충돌만 없으면 무관)
  await app.register(authRoutes)
  await app.register(portfolioRoutes)
  await app.register(holdingRoutes)
  await app.register(watchlistRoutes)
  await app.register(quotesRoutes)
  await app.register(dashboardRoutes)

  app.get("/health", async () => ({ status: "ok" }))

  try {
    await app.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
