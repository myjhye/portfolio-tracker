import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import {
  getPortfoliosHandler,
  getPortfolioHandler,
  createPortfolioHandler,
  updatePortfolioHandler,
  deletePortfolioHandler,
} from "./portfolio.handler"

export async function portfolioRoutes(app: FastifyInstance) {
  app.get("/portfolios", { preHandler: authenticate }, getPortfoliosHandler)
  app.get<{ Params: { id: string } }>("/portfolios/:id", { preHandler: authenticate }, getPortfolioHandler)
  app.post("/portfolios", { preHandler: authenticate }, createPortfolioHandler)
  app.patch<{ Params: { id: string } }>("/portfolios/:id", { preHandler: authenticate }, updatePortfolioHandler)
  app.delete<{ Params: { id: string } }>("/portfolios/:id", { preHandler: authenticate }, deletePortfolioHandler)
}
