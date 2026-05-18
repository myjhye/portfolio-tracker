import { FastifyInstance } from "fastify"
import { authenticate } from "../../plugins/auth"
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  deleteAccountHandler,
} from "./auth.handler"

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", registerHandler)
  app.post("/auth/login", loginHandler)
  app.post("/auth/logout", logoutHandler)
  app.delete("/auth/me", { preHandler: authenticate }, deleteAccountHandler)
}
