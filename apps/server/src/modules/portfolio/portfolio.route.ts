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
  app.get("/portfolios/:id", { preHandler: authenticate }, getPortfolioHandler)
  app.post("/portfolios", { preHandler: authenticate }, createPortfolioHandler)
  app.patch("/portfolios/:id", { preHandler: authenticate }, updatePortfolioHandler)
  app.delete("/portfolios/:id", { preHandler: authenticate }, deletePortfolioHandler)
}
