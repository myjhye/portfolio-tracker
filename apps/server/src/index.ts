import Fastify from "fastify"
import { registerPlugins } from "./plugins/index"
import { authRoutes } from "./modules/auth/auth.route"
import { portfolioRoutes } from "./modules/portfolio/portfolio.route"
import { holdingRoutes } from "./modules/holding/holding.route"

const app = Fastify({ logger: true })

const start = async () => {
  await registerPlugins(app)
  await app.register(authRoutes)
  await app.register(portfolioRoutes)
  await app.register(holdingRoutes)

  app.get("/health", async () => ({ status: "ok" }))

  try {
    await app.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
