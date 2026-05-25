import { FastifyInstance } from "fastify"
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"

export async function registerPlugins(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: /^http:\/\/localhost:\d+$/,
    credentials: true,
  })

  await app.register(fastifyCookie)

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret",
    cookie: {
      cookieName: "token",
      signed: false,
    },
  })
}
