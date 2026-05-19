import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import {
  addHoldingHandler,
  updateHoldingHandler,
  deleteHoldingHandler,
  reorderHoldingsHandler,
} from "./holding.handler"

export async function holdingRoutes(app: FastifyInstance) {
  app.post("/portfolios/:portfolioId/holdings", { preHandler: authenticate }, addHoldingHandler)
  // reorder는 :id 라우트보다 먼저 등록 (reorder가 id로 매칭되지 않도록)
  app.patch("/portfolios/:portfolioId/holdings/reorder", { preHandler: authenticate }, reorderHoldingsHandler)
  app.patch("/portfolios/:portfolioId/holdings/:id", { preHandler: authenticate }, updateHoldingHandler)
  app.delete("/portfolios/:portfolioId/holdings/:id", { preHandler: authenticate }, deleteHoldingHandler)
}
