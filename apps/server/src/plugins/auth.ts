import { FastifyRequest, FastifyReply } from "fastify"

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.status(401).send({ message: "인증이 필요합니다" })
  }
}
