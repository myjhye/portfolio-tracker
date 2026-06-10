import { FastifyInstance } from "fastify"
import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"

// ── Fastify 플러그인 일괄 등록 ──
export async function registerPlugins(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: [
      /^http:\/\/localhost:\d+$/,
      "https://portfolio-tracker-client-fzx9.vercel.app",
    ],
    credentials: true,
  })

  // 쿠키 파싱 (JWT 쿠키 인증에 필요)
  await app.register(fastifyCookie)

  // JWT: 쿠키 기반 인증 (token 쿠키에서 자동 추출)
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret",
    cookie: {
      cookieName: "token",
      signed: false,
    },
  })
}
