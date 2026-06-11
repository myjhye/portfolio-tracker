# PortfolioTracker

React + Fastify 기반 풀스택 주식 포트폴리오 트래커

## 라이브 데모

| 항목 | 링크 |
|---|---|
| **사용자 화면** | [portfolio-tracker-client-fzx9.vercel.app](https://portfolio-tracker-client-fzx9.vercel.app) |
| **API Health Check** | [portfolio-tracker-production-f784.up.railway.app/health](https://portfolio-tracker-production-f784.up.railway.app/health) |

배포 환경: Vercel(프론트) + Railway(백엔드 + PostgreSQL + Redis)

## 핵심 특징

- **멀티 포트폴리오 관리** — 포트폴리오 생성/수정/삭제, 보유 종목 CRUD
- **실시간 시세 조회** — Alpha Vantage API + Redis 24시간 캐싱
- **수익률 라인차트** — Recharts 기반 기간별(1W/1M/3M) 종가 차트
- **종목 비중 파이차트** — 보유 종목 평가금액 기준 도넛 차트
- **드래그앤드롭 정렬** — dnd-kit으로 보유 종목 순서 편집 + PATCH API 연동
- **낙관적 업데이트** — 종목 추가/삭제 시 서버 응답 전 UI 즉시 반영, 실패 시 자동 롤백
- **관심 종목 Watchlist** — 종목 추가/삭제 + 현재가 실시간 폴링
- **JWT 인증** — HTTP-only cookie 기반 보안 인증
- **Zod 스키마 공유** — `packages/shared`에서 프론트-백 타입 단일 소스 관리
- **에러 바운더리** — 차트/리스트 영역별 독립 에러 처리
- **단위 테스트** — Vitest + Testing Library (폼, Protected Route, 낙관적 업데이트)


## 기술 스택

### Frontend (`apps/client/`)

| 분류 | 기술 |
|---|---|
| 기반 | React 18, TypeScript, Vite |
| 상태관리 | Zustand |
| 서버 상태 | TanStack Query (캐싱, 폴링, 낙관적 업데이트) |
| 스타일링 | Tailwind CSS, shadcn/ui |
| 차트 | Recharts |
| 폼 | React Hook Form + Zod |
| 드래그앤드롭 | dnd-kit |
| 테스트 | Vitest + Testing Library |
| 배포 | Vercel |

### Backend (`apps/server/`)

| 분류 | 기술 |
|---|---|
| 언어/프레임워크 | Node.js, Fastify, TypeScript |
| ORM | Prisma |
| DB | PostgreSQL |
| 캐시 | Redis (시세 24시간 TTL) |
| 인증 | JWT + HTTP-only cookie |
| 유효성 검사 | Zod (shared 패키지) |
| 배포 | Railway |

### 공유 패키지 (`packages/shared/`)

Zod 스키마 + TypeScript 타입 — 프론트/백엔드 단일 소스. 한 곳에서 수정하면 양쪽에 자동 반영되어 타입 불일치를 컴파일 타임에 차단한다.

### 인프라

Turborepo (monorepo), Docker (로컬 DB), Railway, Vercel


## 주요 기능 상세

### 포트폴리오 관리
보유 종목별 현재가 × 수량으로 평가금액을 실시간 계산한다. 기간별 수익률 라인차트와 종목 비중 도넛 차트로 포트폴리오를 시각화한다. dnd-kit으로 종목 순서를 드래그앤드롭으로 편집하고 서버에 PATCH 요청으로 동기화한다.

### 실시간 시세 + 캐싱 전략
Alpha Vantage API로 시세를 가져오고 Redis에 24시간 캐싱한다. 동일 종목은 하루에 한 번만 외부 API를 호출하고 나머지는 Redis에서 반환해서 무료 티어 호출 한도를 최소화한다.

### 낙관적 업데이트
종목 추가/삭제 시 서버 응답을 기다리지 않고 UI를 먼저 반영한다. `onMutate`에서 현재 캐시를 백업하고 UI를 즉시 업데이트한 뒤, 실패하면 `onError`에서 백업 데이터로 자동 롤백한다.

### Zod 스키마 공유
```ts
// packages/shared/src/holding.ts
export const AddHoldingSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
})
export type AddHoldingInput = z.infer<typeof AddHoldingSchema>

// 백엔드: 요청 유효성 검사
const body = AddHoldingSchema.parse(req.body)

// 프론트: 폼 유효성 검사
useForm<AddHoldingInput>({ resolver: zodResolver(AddHoldingSchema) })
```

## 아키텍처

상세 설계 문서: [docs/architecture.md](./docs/architecture.md)

### 시스템 구성

```text
사용자
│ HTTPS
▼
Vercel (React + Vite)
│ HTTPS + Cookie
▼
Railway
├── Fastify API 서버 (public)
├── PostgreSQL (internal)
└── Redis (internal)
│ HTTPS
▼
Alpha Vantage API (외부 시세)
```

### 시세 조회 흐름

```text
클라이언트 요청
▼
Redis 캐시 확인
├─ hit  → 즉시 반환 (API 호출 없음)
└─ miss → Alpha Vantage 호출 → Redis 저장 (24시간) → 반환
```

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
├── vercel.json                  # Vercel SPA 라우팅 설정
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

# DB 실행 (PostgreSQL + Redis)
docker compose up -d

# 환경변수 설정
cp apps/server/.env.example apps/server/.env
# .env 파일에 아래 값 입력
# DATABASE_URL, REDIS_URL, JWT_SECRET, ALPHA_VANTAGE_API_KEY

# DB 테이블 생성
cd apps/server && pnpm exec prisma db push && cd ../..

# 개발 서버 실행 (클라이언트 + 서버 동시)
pnpm dev
```

| 서비스 | URL |
|---|---|
| 클라이언트 | http://localhost:5173 |
| 서버 | http://localhost:4000 |
| Health Check | http://localhost:4000/health |


## 배포

### Railway (백엔드)

| 서비스 | 역할 | 노출 |
|---|---|---|
| `portfolio-tracker` | Fastify API 서버 | public |
| `Postgres` | 프로덕션 DB | internal only |
| `Redis` | 시세 캐시 | internal only |

`main` 브랜치 push 시 자동 빌드 및 재배포.

### Vercel (프론트엔드)

`main` 브랜치 push 시 자동 배포. `VITE_API_URL` 환경변수를 Railway 서버 URL로 설정.


## 환경변수

### `apps/server/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
ALPHA_VANTAGE_API_KEY=your-api-key
```

### `apps/client/.env`

```env
VITE_API_URL=http://localhost:4000
VITE_GATE_PASSWORD=your-gate-password
```
