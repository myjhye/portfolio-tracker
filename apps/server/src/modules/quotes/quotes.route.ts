/**
 * 시세(Quotes) 라우트
 */
import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import { getQuoteHandler, getHistoryHandler } from "./quotes.handler"

export async function quotesRoutes(app: FastifyInstance) {
  /** GET /quotes/:symbol — 종목 시세 (Redis 캐시 + Alpha Vantage) */
  app.get("/quotes/:symbol", { preHandler: authenticate }, getQuoteHandler)
  /** GET /quotes/:symbol/history — 일별 종가 히스토리 (Redis 1시간 캐시) */
  app.get("/quotes/:symbol/history", { preHandler: authenticate }, getHistoryHandler)
}
