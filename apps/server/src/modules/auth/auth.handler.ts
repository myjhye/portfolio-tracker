import { FastifyRequest, FastifyReply } from "fastify"
import bcrypt from "bcrypt"
import prisma from "../../lib/prisma"
import { RegisterSchema, LoginSchema } from "@portfolio-tracker/shared"

export async function registerHandler(req: FastifyRequest, reply: FastifyReply) {
  const body = RegisterSchema.parse(req.body)

  const exists = await prisma.user.findUnique({ where: { email: body.email } })
  if (exists) return reply.status(409).send({ message: "이미 사용중인 이메일입니다" })

  const hashed = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: { email: body.email, password: hashed, name: body.name },
  })

  const token = await reply.jwtSign({ id: user.id, email: user.email })
  reply
    .setCookie("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 })
    .send({ id: user.id, email: user.email, name: user.name })
}

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const body = LoginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) return reply.status(401).send({ message: "이메일 또는 비밀번호가 틀렸습니다" })

  const valid = await bcrypt.compare(body.password, user.password)
  if (!valid) return reply.status(401).send({ message: "이메일 또는 비밀번호가 틀렸습니다" })

  const token = await reply.jwtSign({ id: user.id, email: user.email })
  reply
    .setCookie("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 })
    .send({ id: user.id, email: user.email, name: user.name })
}

export async function logoutHandler(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("token", { path: "/" }).send({ message: "로그아웃 되었습니다" })
}

export async function deleteAccountHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.user as { id: string }
  await prisma.user.delete({ where: { id } })
  reply.clearCookie("token", { path: "/" }).send({ message: "계정이 삭제되었습니다" })
}
