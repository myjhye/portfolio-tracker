/**
 * 관심 종목(Watchlist) 핸들러
 *
 * 포트폴리오와 별도로 사용자별 관심 종목 심볼만 저장합니다.
 * authenticate 미들웨어 이후 req.user.id로 본인 watchlist만 조회·추가·삭제합니다.
 * schema의 @@unique([userId, symbol])로 동일 종목 중복 추가를 DB에서도 막습니다.
 */
import { FastifyRequest, FastifyReply } from "fastify"
import prisma from "../../lib/prisma"
import { AddWatchlistSchema } from "@portfolio-tracker/shared"

/**
 * GET /watchlist — 로그인 사용자의 관심 종목 목록
 */
export async function getWatchlistHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }

  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // 최근 추가 순
  })

  reply.send(watchlist)
}

/**
 * POST /watchlist — 관심 종목 추가
 */
export async function addWatchlistHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }

  // symbol은 Zod에서 대문자로 변환됨
  const body = AddWatchlistSchema.parse(req.body)

  // 복합 유니크 (userId, symbol)로 중복 여부 확인
  const exists = await prisma.watchlist.findUnique({
    where: { userId_symbol: { userId, symbol: body.symbol } },
  })
  if (exists) return reply.status(409).send({ message: "이미 추가된 종목입니다" })

  const item = await prisma.watchlist.create({
    data: { userId, symbol: body.symbol },
  })

  reply.status(201).send(item)
}

/**
 * DELETE /watchlist/:symbol — URL 경로의 심볼로 관심 종목 삭제
 *
 * deleteMany 사용: 해당 userId+symbol 행이 없어도 200 (멱등)
 */
export async function deleteWatchlistHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id: userId } = req.user as { id: string }
  const { symbol } = req.params as { symbol: string }

  await prisma.watchlist.deleteMany({
    where: { userId, symbol },
  })

  reply.send({ message: "관심 종목이 삭제되었습니다" })
}
