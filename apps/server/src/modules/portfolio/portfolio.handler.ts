/**
 * 포트폴리오 CRUD 핸들러
 *
 * 모든 핸들러는 라우트의 authenticate 미들웨어를 거친 뒤 실행됩니다.
 * req.user(JWT payload)에서 userId를 꺼내, 본인 소유 포트폴리오만 조회·수정·삭제합니다.
 */
import { FastifyRequest, FastifyReply } from "fastify"
import prisma from "../../lib/prisma"
import { CreatePortfolioSchema, UpdatePortfolioSchema } from "@portfolio-tracker/shared"

/**
 * GET /portfolios — 로그인한 사용자의 포트폴리오 목록
 */
export async function getPortfoliosHandler(req: FastifyRequest, reply: FastifyReply) {
  // JWT에서 추출한 사용자 ID (다른 사용자 데이터는 조회하지 않음)
  const { id: userId } = req.user as { id: string }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // 최신 생성 순
  })

  reply.send(portfolios)
}

/**
 * GET /portfolios/:id — 단일 포트폴리오 상세 (보유 종목 포함)
 */
export async function getPortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }

  // id + userId 동시 조건 → 타인 포트폴리오 ID로 접근해도 404
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId },
    include: { holdings: { orderBy: { order: "asc" } } }, // UI 표시 순서대로 종목
  })

  if (!portfolio) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })

  reply.send(portfolio)
}

/**
 * POST /portfolios — 포트폴리오 생성
 */
export async function createPortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }

  // shared 패키지 Zod 스키마로 name, description 검증
  const body = CreatePortfolioSchema.parse(req.body)

  const portfolio = await prisma.portfolio.create({
    data: { ...body, userId }, // 생성 시 소유자를 현재 로그인 사용자로 고정
  })

  reply.status(201).send(portfolio)
}

/**
 * PATCH /portfolios/:id — 포트폴리오 수정 (name, description 등 partial)
 */
export async function updatePortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }

  const body = UpdatePortfolioSchema.parse(req.body)

  // update 전 소유권 확인 (Prisma update는 where에 userId를 넣지 않으므로 선검사)
  const exists = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!exists) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })

  const portfolio = await prisma.portfolio.update({
    where: { id },
    data: body,
  })

  reply.send(portfolio)
}

/**
 * DELETE /portfolios/:id — 포트폴리오 삭제
 *
 * schema의 onDelete: Cascade로 연결된 Holding도 함께 삭제됩니다.
 */
export async function deletePortfolioHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { id } = req.params as { id: string }

  const exists = await prisma.portfolio.findFirst({ where: { id, userId } })
  if (!exists) return reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })

  await prisma.portfolio.delete({ where: { id } })

  reply.send({ message: "포트폴리오가 삭제되었습니다" })
}
