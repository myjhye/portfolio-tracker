import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import { getDashboardHandler } from "./dashboard.handler"

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", { preHandler: authenticate }, getDashboardHandler)
}
