import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import {
  getWatchlistHandler,
  addWatchlistHandler,
  deleteWatchlistHandler,
} from "./watchlist.handler"

export async function watchlistRoutes(app: FastifyInstance) {
  app.get("/watchlist", { preHandler: authenticate }, getWatchlistHandler)
  app.post("/watchlist", { preHandler: authenticate }, addWatchlistHandler)
  app.delete("/watchlist/:symbol", { preHandler: authenticate }, deleteWatchlistHandler)
}
