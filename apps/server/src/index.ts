import Fastify from "fastify"
import { registerPlugins } from "./plugins/index"
import { authRoutes } from "./modules/auth/auth.route"

const app = Fastify({ logger: true })

const start = async () => {
  await registerPlugins(app)
  await app.register(authRoutes)

  app.get("/health", async () => ({ status: "ok" }))

  try {
    await app.listen({ port: 4000, host: "0.0.0.0" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
