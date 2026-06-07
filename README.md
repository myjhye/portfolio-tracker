# PortfolioTracker

React + Fastify 기반 풀스택 주식 포트폴리오 트래커

## 라이브 데모

| 항목 | 링크 |
|---|---|
| **사용자 화면** | 배포 예정 |
| **API Health Check** | [portfolio-tracker-production-f784.up.railway.app/health](https://portfolio-tracker-production-f784.up.railway.app/health) |

배포 환경: Vercel(프론트) + Railway(백엔드 + PostgreSQL + Redis)

## 핵심 특징

- **멀티 포트폴리오 관리** — 포트폴리오 생성/수정/삭제, 보유 종목 CRUD
- **실시간 시세 조회** — Alpha Vantage API + Redis 캐싱 (24시간 TTL)
- **수익률 차트** — Recharts 기반 기간별(1W/1M/3M) 라인차트
- **종목 비중 파이차트** — 보유 종목 평가금액 기준 도넛 차트
- **드래그앤드롭 정렬** — dnd-kit으로 보유 종목 순서 편집
- **낙관적 업데이트** — 종목 추가/삭제 시 서버 응답 전 UI 즉시 반영
- **관심 종목 Watchlist** — 종목 추가/삭제 + 현재가 폴링
- **JWT 인증** — HTTP-only cookie 기반 보안 인증
- **Zod 스키마 공유** — 프론트-백 타입 단일 소스 관리

## 기술 스택

### Frontend (`apps/client/`)

| 분류 | 기술 |
|---|---|
| 기반 | React 18, TypeScript, Vite |
| 상태관리 | Zustand (인증, 전역 상태) |
| 서버 상태 | TanStack Query (캐싱, 폴링, 낙관적 업데이트) |
| 스타일링 | Tailwind CSS, shadcn/ui |
| 차트 | Recharts |
| 폼 | React Hook Form + Zod |
| 드래그앤드롭 | dnd-kit |
| 테스트 | Vitest + Testing Library |

### Backend (`apps/server/`)

| 분류 | 기술 |
|---|---|
| 언어/프레임워크 | Node.js, Fastify, TypeScript |
| ORM | Prisma |
| DB | PostgreSQL |
| 캐시 | Redis (시세 24시간 TTL) |
| 인증 | JWT + HTTP-only cookie |
| 유효성 검사 | Zod (shared 패키지) |

### 공유 패키지 (`packages/shared/`)

Zod 스키마 + TypeScript 타입 — 프론트/백엔드 단일 소스

### 인프라

Turborepo (monorepo), Docker (로컬 DB), Railway, Vercel

## 주요 기능

### 포트폴리오 관리
보유 종목별 현재가 × 수량으로 평가금액을 계산하고, 기간별 수익률 차트와 종목 비중 파이차트로 시각화한다.

### 실시간 시세 + 캐싱 전략
Alpha Vantage API로 시세를 가져오고 Redis에 24시간 캐싱한다. 무료 티어 API 호출 한도를 최소화하면서 데모 환경에서 안정적으로 동작한다.

### 낙관적 업데이트
종목 추가/삭제 시 서버 응답을 기다리지 않고 UI를 먼저 반영한다. 실패하면 이전 상태로 자동 롤백한다.

### Zod 스키마 공유
`packages/shared`에 Zod 스키마를 한 번만 정의하고 프론트(폼 유효성 검사)와 백엔드(요청 검증) 양쪽에서 가져다 쓴다. 타입 불일치를 컴파일 타임에 차단한다.

## 디렉토리 구조

```text
portfolio-tracker/
├── apps/
│   ├── client/                  # React 프론트엔드
│   │   └── src/
│   │       ├── api/             # API 클라이언트 (portfolio, holding, quote ...)
│   │       ├── components/      # 공통 컴포넌트 (chart, holding, layout ...)
│   │       ├── pages/           # 페이지 (dashboard, portfolio, watchlist ...)
│   │       ├── routes/          # ProtectedRoute, PublicRoute
│   │       ├── store/           # Zustand 스토어 (authStore)
│   │       └── test/            # Vitest 단위 테스트
│   │
│   └── server/                  # Fastify 백엔드
│       ├── src/
│       │   ├── lib/             # prisma, redis, alphaVantage 클라이언트
│       │   ├── modules/         # auth, portfolio, holding, watchlist, quotes, dashboard
│       │   ├── plugins/         # jwt, cookie, cors 플러그인 + authenticate 미들웨어
│       │   └── index.ts
│       └── prisma/
│           └── schema.prisma    # User, Portfolio, Holding, Watchlist
│
├── packages/
│   └── shared/                  # Zod 스키마 + 공통 타입
│       └── src/
│           ├── user.ts
│           ├── portfolio.ts
│           ├── holding.ts
│           └── watchlist.ts
│
├── docker-compose.yml           # 로컬 PostgreSQL + Redis
├── turbo.json
└── pnpm-workspace.yaml
```

## 로컬 실행

**사전 준비:** Node.js 20+, pnpm, Docker

```bash
# 저장소 클론
git clone https://github.com/myjhye/portfolio-tracker.git
cd portfolio-tracker

# 의존성 설치
pnpm install

# DB 실행
docker compose up -d

# 환경변수 설정
cp apps/server/.env.example apps/server/.env
# DATABASE_URL, REDIS_URL, JWT_SECRET, ALPHA_VANTAGE_API_KEY 입력

# DB 테이블 생성
cd apps/server && pnpm exec prisma db push && cd ../..

# 개발 서버 실행
pnpm dev
```

- 클라이언트: http://localhost:5173
- 서버: http://localhost:4000

## 배포

### Railway (백엔드)

| 서비스 | 역할 | 노출 |
|---|---|---|
| `portfolio-tracker` | Fastify API 서버 | public |
| `Postgres` | 프로덕션 DB | internal only |
| `Redis` | 시세 캐시 | internal only |

### Vercel (프론트엔드)

`main` 브랜치 push 시 자동 배포. `VITE_API_URL` 환경변수를 Railway 서버 URL로 설정.

## 환경변수

### `apps/server/.env`
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
ALPHA_VANTAGE_API_KEY=...

### `apps/client/.env`
VITE_API_URL=http://localhost:4000
