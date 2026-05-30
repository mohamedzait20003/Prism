# PRism

An AI-powered code review agent that reviews GitHub pull requests, posts inline comments, learns from human feedback, and self-improves its own rules over time.

---

## How it works

1. A pull request is opened or updated on GitHub
2. GitHub sends a webhook to `/api/webhook`
3. A review job is enqueued in Redis via BullMQ
4. The worker fetches the diff and runs it through the GitAgent reviewer
5. The agent scans for code smells and OWASP Top 10 vulnerabilities in parallel
6. Findings are posted as inline GitHub review comments and saved to PostgreSQL
7. Authenticated users approve or reject each comment in the dashboard
8. Rejections are committed to `agent/memory/feedback.md` — locally via `simple-git` in development, or via the GitHub API in production
9. When 3+ rejections accumulate for the same rule, the meta-agent proposes rule changes on a new branch

---

## Architecture

```
Browser
  │  Sign in with GitHub (NextAuth)
  │  Protected by src/proxy.ts (withAuth)
  ▼
Next.js App (Vercel)
├── / ─────────────────── Landing page
├── /login ───────────── GitHub OAuth login
├── /dashboard ───────── Metrics, recent reviews, top rejected rules
├── /reviews/[id] ────── PR findings + approve/reject UI
├── /agents/reviewer ─── SOUL.md / RULES.md editor + git log
└── /api/* ───────────── All data endpoints

GitHub Webhook ─► POST /api/webhook ─► BullMQ Queue (Redis)
                                              │
                                         Worker (Render)
                                         ├── fetchDiff
                                         ├── runReview (GitAgent SDK)
                                         │    ├── code-smell skill
                                         │    ├── security-audit skill
                                         │    └── review-summary skill
                                         ├── postReview (GitHub API)
                                         └── db.review.create (PostgreSQL)

Feedback loop
├── POST /api/feedback ── approve / reject comment (DB transaction)
├── writeFeedback() ───── commit to feedback.md (git or GitHub API)
└── npm run cron ──────── meta-agent proposes rule updates
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Queue | BullMQ + official `redis` client (`createNodeRedisClient`) |
| AI agent | `@open-gitagent/gitagent` SDK (Anthropic Claude) |
| GitHub API | Octokit (`@octokit/rest`) |
| Git operations | `simple-git` (dev) / GitHub API (production) |
| Authentication | NextAuth.js v4 — GitHub OAuth, `withAuth` proxy |
| Unit tests | Vitest |
| E2E tests | Playwright (Chromium) |

---

## Project structure

```
prism/
├── src/
│   ├── proxy.ts                     Route protection (Next.js 16 withAuth)
│   ├── app/
│   │   ├── page.tsx                 Landing page
│   │   ├── login/                   GitHub OAuth sign-in page
│   │   ├── nav.tsx                  Sticky nav — user avatar, sign-out
│   │   ├── layout.tsx               Root layout with SessionProvider
│   │   ├── dashboard/               Metrics cards, reviews table, rejected rules
│   │   ├── reviews/[prId]/          PR findings + approve/reject flow
│   │   ├── agents/[id]/             SOUL.md + RULES.md editor, git history
│   │   └── api/
│   │       ├── auth/[...nextauth]/  NextAuth handler (GitHub OAuth)
│   │       ├── agents/[id]/         GET files + commits, POST save
│   │       ├── feedback/            POST approve/reject (DB transaction)
│   │       ├── reviews/             GET list, GET [id]
│   │       ├── run/                 POST manual trigger
│   │       ├── stats/               GET dashboard metrics
│   │       └── webhook/             POST GitHub webhook (HMAC verified)
│   ├── config/
│   │   ├── prisma.config.ts         Prisma 7 datasource + schema path
│   │   └── redis.config.ts          Official redis client + BullMQ connection
│   ├── cron/
│   │   └── meta-agent.ts            Self-improvement script (npm run cron)
│   ├── lib/
│   │   ├── crypto.ts                HMAC signature verification
│   │   ├── db.ts                    Prisma client singleton (pg adapter)
│   │   ├── gitagent.ts              GitAgent SDK wrapper (dynamic ESM import)
│   │   ├── github.ts                Octokit — fetchDiff, postReview, parseRepo
│   │   ├── memory.ts                Feedback writer — local git or GitHub API
│   │   ├── queue.ts                 BullMQ Queue definition
│   │   └── worker.ts                BullMQ Worker — full review pipeline
│   └── models/
│       ├── agent.ts                 Finding, AgentData
│       ├── queue.ts                 ReviewJobPayload, FeedbackEntry
│       ├── review.ts                Comment, ReviewSummary, ReviewDetail
│       ├── stats.ts                 Stats
│       └── index.ts                 Re-exports all models
├── agent/                           GitAgent definition
│   ├── agent.yaml                   Manifest: model, skills, compliance
│   ├── SOUL.md                      Identity and tone
│   ├── RULES.md                     Must-flag / must-never-flag rules
│   ├── DUTIES.md                    Role permissions
│   ├── AGENTS.md                    Output format instructions
│   ├── memory/feedback.md           Append-only rejection log
│   ├── knowledge/                   OWASP Top 10 + antipatterns
│   ├── skills/                      code-smell, security-audit, review-summary
│   ├── workflows/review-flow.yaml   Parallel skill execution
│   └── agents/meta-agent/           Sub-agent for rule proposals
├── prisma/schema.prisma             Review, Comment, FeedbackEntry models
├── tests/
│   ├── unit/                        Vitest — crypto, github, memory, detect
│   └── e2e/                         Playwright — landing, login, nav, dashboard, agents
├── .env.example                     All required variables with descriptions
├── render.yaml                      Render deployment config (app + worker)
└── .github/workflows/
    ├── agent-ci.yml                 Validates agent YAML on every push
    └── deploy.yml                   Tests → DB migration → Vercel → Render
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in each value:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/prism

# GitHub — webhook integration
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# GitHub — OAuth app (for dashboard login)
GITHUB_CLIENT_ID=your-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-oauth-app-client-secret

# NextAuth session
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                         # openssl rand -base64 32

# Anthropic — read automatically by the GitAgent SDK
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password

# Agent files
AGENT_REPO_PATH=./agent
NEXT_PUBLIC_APP_URL=http://localhost:3000

# true  → local filesystem + simple-git  (development)
# false → GitHub API via Octokit          (production / Vercel / Render)
IS_DEVELOPMENT=true
GITHUB_REPO=owner/prism                  # required when IS_DEVELOPMENT=false
```

---

## Authentication setup

PRism uses GitHub OAuth. Create an OAuth App:

1. **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set the fields:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Copy **Client ID** → `GITHUB_CLIENT_ID`
4. Generate a **Client Secret** → `GITHUB_CLIENT_SECRET`
5. Generate a session secret: `openssl rand -base64 32` → `NEXTAUTH_SECRET`

For production, update both URLs to your deployed domain before creating the app.

Routes protected by `src/proxy.ts`: `/dashboard`, `/reviews/*`, `/agents/*`

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all values
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Start the dev server

```bash
npm run dev
```

### 5. Start the worker (separate terminal)

```bash
npm run worker
```

### 6. Expose the webhook endpoint

```bash
npx ngrok http 3000
```

Register the ngrok URL + `/api/webhook` as a GitHub webhook. Select the **Pull requests** event only.

---

## Running tests

```bash
# Unit tests (Vitest) — 16 tests, no server required
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (Playwright — requires npm run dev to be running)
npm run test:e2e

# Interactive E2E UI
npm run test:e2e:ui
```

**Unit tests cover:** HMAC signature verification, `parseRepo`, `writeFeedback` (mocked), `extractAddedLines` diff parser

**E2E tests cover:** Landing page, login page, auth redirect, dashboard (API mocked), agent editor (API mocked)

---

## API reference

All data routes require an authenticated session.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/webhook` | HMAC only | GitHub webhook — enqueues review job |
| `POST` | `/api/run` | Session | Manual trigger — `{ repo, prNum }` |
| `POST` | `/api/feedback` | Session | Approve/reject comment — `{ commentId, approved, humanEdit? }` |
| `GET` | `/api/stats` | Session | Dashboard metrics |
| `GET` | `/api/reviews` | Session | Recent reviews list |
| `GET` | `/api/reviews/[id]` | Session | Single review with comments |
| `GET` | `/api/agents/[id]` | Session | SOUL.md, RULES.md, commit history |
| `POST` | `/api/agents/[id]/save` | Session | Write SOUL.md and RULES.md — `{ soul, rules }` |

---

## Agent self-improvement

```bash
npm run cron
```

- Reads `agent/memory/feedback.md`
- Exits if fewer than 3 rejection entries
- Groups rejections by `ruleId`, calls the meta-agent
- Commits proposed rule diffs to a new branch: `meta-agent/update-{timestamp}`
- A human must open and merge the PR — the agent cannot self-approve

---

## Deployment

### Recommended free stack

| Component | Platform | Notes |
|---|---|---|
| Next.js app | **Vercel** | Auto-deploy on push, always-on |
| Worker | **Render** (Background Worker) | Free tier — sleeps after 15 min idle; jobs are held in Redis and processed on wake |
| Redis | **Upstash** or any managed Redis | Free tier available |
| PostgreSQL | **Prisma Postgres** | Already configured in `.env.local` |

Set `IS_DEVELOPMENT=false` and `GITHUB_REPO=owner/prism` on both Vercel and Render.

### CI/CD pipeline (GitHub Actions)

On every push to `main`:

| Job | What it does |
|---|---|
| `test` | Runs all Vitest unit tests |
| `migrate` | Runs `prisma db push` against the production DB |
| `deploy-frontend` | Builds and deploys to Vercel via CLI |
| `deploy-worker` | Triggers the Render background worker deploy hook |

**Required GitHub Actions secrets:** `DATABASE_URL`, `VERCEL_TOKEN`, `RENDER_DEPLOY_HOOK_URL`

Disable auto-deploy on both Vercel and Render so only the Actions pipeline triggers deployments.

---

## CI — Agent validation

`.github/workflows/agent-ci.yml` runs on every push and pull request:

- Checks all required `agent/` files are present
- Validates `agent/agent.yaml` and `agent/agents/meta-agent/agent.yaml` parse as valid YAML
