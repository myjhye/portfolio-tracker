/**
 * Redis 클라이언트 싱글톤
 *
 * 시세 캐시 등 서버 전역에서 하나의 연결을 재사용합니다.
 * REDIS_URL 미설정 시 docker-compose 기본 주소(localhost:6379) 사용.
 */
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379")

export default redis
