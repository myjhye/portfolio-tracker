/**
 * 보유 종목(Holding) CRUD 핸들러
 *
 * 모든 핸들러는 authenticate 미들웨어 이후 실행됩니다.
 * URL의 portfolioId로 대상 포트폴리오를 지정하고, verifyPortfolioOwner로 로그인 사용자의 소유 여부를 확인한 뒤 종목을 추가·수정·삭제·정렬합니다.
 */
import { FastifyRequest, FastifyReply } from "fastify"
import prisma from "../../lib/prisma"
import { AddHoldingSchema, UpdateHoldingSchema } from "@portfolio-tracker/shared"

/**
 * portfolioId + userId로 포트폴리오 소유권 확인
 * @returns 소유 포트폴리오 | null (404 응답 후)
 */
async function verifyPortfolioOwner(portfolioId: string, userId: string, reply: FastifyReply) {
  const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId } })
  if (!portfolio) {
    reply.status(404).send({ message: "포트폴리오를 찾을 수 없습니다" })
    return null
  }
  return portfolio
}

/**
 * POST /portfolios/:portfolioId/holdings — 종목 추가
 */
export async function addHoldingHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { portfolioId } = req.params as { portfolioId: string }

  const portfolio = await verifyPortfolioOwner(portfolioId, userId, reply)
  if (!portfolio) return

  // symbol(대문자), quantity, avgPrice 검증
  const body = AddHoldingSchema.parse(req.body)

  // 기존 종목 개수 = 맨 뒤 order (0부터 시작)
  const count = await prisma.holding.count({ where: { portfolioId } })
  const holding = await prisma.holding.create({
    data: { ...body, portfolioId, order: count },
  })

  reply.status(201).send(holding)
}

/**
 * PATCH /portfolios/:portfolioId/holdings/:id — 종목 수정 (quantity, avgPrice partial)
 */
export async function updateHoldingHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { portfolioId, id } = req.params as { portfolioId: string; id: string }

  const portfolio = await verifyPortfolioOwner(portfolioId, userId, reply)
  if (!portfolio) return

  // quantity 또는 avgPrice 중 하나 이상 필수
  const body = UpdateHoldingSchema.parse(req.body)

  const holding = await prisma.holding.update({
    where: { id },
    data: body,
  })

  reply.send(holding)
}

/**
 * DELETE /portfolios/:portfolioId/holdings/:id — 종목 삭제
 */
export async function deleteHoldingHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { portfolioId, id } = req.params as { portfolioId: string; id: string }

  const portfolio = await verifyPortfolioOwner(portfolioId, userId, reply)
  if (!portfolio) return

  await prisma.holding.delete({ where: { id } })

  reply.send({ message: "종목이 삭제되었습니다" })
}

/**
 * PATCH /portfolios/:portfolioId/holdings/reorder — 종목 표시 순서 변경
 *
 * Body: { ids: string[] } — 원하는 순서대로 holding id 배열
 */
export async function reorderHoldingsHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { portfolioId } = req.params as { portfolioId: string }

  const portfolio = await verifyPortfolioOwner(portfolioId, userId, reply)
  if (!portfolio) return

  const { ids } = req.body as { ids: string[] }

  // 배열 인덱스를 order 필드에 일괄 반영
  await Promise.all(
    ids.map((id, index) => prisma.holding.update({ where: { id }, data: { order: index } }))
  )

  reply.send({ message: "순서가 업데이트되었습니다" })
}
