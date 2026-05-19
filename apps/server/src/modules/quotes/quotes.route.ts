/**
 * 시세(Quotes) 라우트
 */
import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import { getQuoteHandler } from "./quotes.handler"

export async function quotesRoutes(app: FastifyInstance) {
  /** GET /quotes/:symbol — 종목 시세 (Redis 캐시 + Alpha Vantage) */
  app.get("/quotes/:symbol", { preHandler: authenticate }, getQuoteHandler)
}
