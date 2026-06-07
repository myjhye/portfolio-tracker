import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import { getQuoteHandler, getHistoryHandler } from "./quotes.handler"

export async function quotesRoutes(app: FastifyInstance) {
  app.get<{ Params: { symbol: string } }>("/quotes/:symbol", { preHandler: authenticate }, getQuoteHandler)
  app.get<{ Params: { symbol: string } }>("/quotes/:symbol/history", { preHandler: authenticate }, getHistoryHandler)
}
