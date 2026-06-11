import { FastifyRequest, FastifyReply } from "fastify"
import bcrypt from "bcrypt"
import prisma from "../../lib/prisma"
import { RegisterSchema, LoginSchema } from "@portfolio-tracker/shared"

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "none" as const,
  secure: true,
}

// ── 회원가입 ──
// 1) 입력값 검증 → 2) 이메일 중복 확인 → 3) 비밀번호 해싱 후 DB 저장 → 4) JWT 쿠키 발급
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
    .setCookie("token", token, TOKEN_COOKIE_OPTIONS)
    .send({ id: user.id, email: user.email, name: user.name })
}

// ── 로그인 ──
// 1) 입력값 검증 → 2) 이메일로 유저 조회 → 3) 비밀번호 비교 → 4) JWT 쿠키 발급
export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const body = LoginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) return reply.status(401).send({ message: "이메일 또는 비밀번호가 틀렸습니다" })

  const valid = await bcrypt.compare(body.password, user.password)
  if (!valid) return reply.status(401).send({ message: "이메일 또는 비밀번호가 틀렸습니다" })

  const token = await reply.jwtSign({ id: user.id, email: user.email })
  reply
    .setCookie("token", token, TOKEN_COOKIE_OPTIONS)
    .send({ id: user.id, email: user.email, name: user.name })
}

// ── 로그아웃: 쿠키 삭제 ──
export async function logoutHandler(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("token", { path: "/", sameSite: "none", secure: true }).send({ message: "로그아웃 되었습니다" })
}

// ── 회원탈퇴: DB에서 유저 삭제 + 쿠키 삭제 ──
export async function deleteAccountHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.user as { id: string }
  await prisma.user.delete({ where: { id } })
  reply.clearCookie("token", { path: "/", sameSite: "none", secure: true }).send({ message: "계정이 삭제되었습니다" })
}
