/**
 * 시세(Quotes) 핸들러
 *
 * Alpha Vantage 호출 전 Redis 캐시를 확인하고, API 실패 시 stale 캐시로 fallback 합니다.
 * 무료 API rate limit 완화를 위해 TTL 24시간 캐시를 사용합니다.
 */
import { FastifyRequest, FastifyReply } from "fastify"
import redis from "../../lib/redis"
import { fetchQuote, fetchDailyHistory } from "../../lib/alphaVantage"

const QUOTE_TTL = 60 * 60 * 24      // 24시간
const HISTORY_TTL = 60 * 60 * 24 * 7 // 7일

/**
 * GET /quotes/:symbol — 종목 시세 조회
 *
 * 응답 필드:
 * - fromCache: true면 Redis에서 반환
 * - stale: true면 API 장애 시 만료된 stale 키 사용
 */
export async function getQuoteHandler(req: FastifyRequest, reply: FastifyReply) {
  const symbol = (req.params as { symbol: string }).symbol.toUpperCase()
  const cacheKey = `quote:${symbol}`

  // 1) 캐시 hit — Alpha Vantage 호출 없이 즉시 반환
  const cached = await redis.get(cacheKey)
  if (cached) {
    return reply.send({ ...JSON.parse(cached), fromCache: true })
  }

  try {
    // 2) 캐시 miss — 외부 API 호출 후 Redis에 저장
    const quote = await fetchQuote(symbol)
    if (!quote) return reply.status(404).send({ message: "종목을 찾을 수 없습니다" })

    await redis.setex(cacheKey, QUOTE_TTL, JSON.stringify(quote))
    reply.send({ ...quote, fromCache: false })
  } catch {
    // 3) API 오류 — stale 키가 있으면 만료 데이터라도 반환
    const stale = await redis.get(`${cacheKey}:stale`)
    if (stale) {
      return reply.send({ ...JSON.parse(stale), fromCache: true, stale: true })
    }
    reply.status(503).send({ message: "시세 데이터를 가져올 수 없습니다" })
  }
}

/**
 * GET /quotes/:symbol/history — 일별 종가 히스토리
 *
 * Redis 7일 캐시 적용
 */
export async function getHistoryHandler(
  req: FastifyRequest<{ Params: { symbol: string } }>,
  reply: FastifyReply
) {
  const symbol = req.params.symbol.toUpperCase()
  const cacheKey = `history:${symbol}`

  const cached = await redis.get(cacheKey)
  if (cached) return reply.send(JSON.parse(cached))

  try {
    const history = await fetchDailyHistory(symbol)
    if (!history) return reply.status(404).send({ message: "히스토리를 찾을 수 없습니다" })
    await redis.setex(cacheKey, HISTORY_TTL, JSON.stringify(history))
    reply.send(history)
  } catch {
    reply.status(503).send({ message: "히스토리 데이터를 가져올 수 없습니다" })
  }
}
