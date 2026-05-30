# PRism

An AI-powered code review agent that reviews GitHub pull requests, posts inline comments, learns from human feedback, and self-improves its own rules over time.

---

## How it works

1. A pull request is opened or updated on GitHub
2. GitHub sends a webhook to `/api/webhook`
3. A review job is enqueued in Redis via BullMQ
4. The worker picks up the job, fetches the diff, and runs it through the GitAgent reviewer
5. The agent scans for code smells and OWASP Top 10 vulnerabilities in parallel
6. Findings are posted as inline GitHub review comments and saved to PostgreSQL
7. Humans approve or reject each comment in the dashboard
8. Rejections are committed to `agent/memory/feedback.md` via git
9. When 3+ rejections accumulate for the same rule, the meta-agent proposes rule changes on a new branch

---

## Architecture

```
GitHub Webhook
      │
      ▼
POST /api/webhook  ──►  BullMQ Queue (Redis)
                                │
                                ▼
                          Worker Process
                          ├── fetchDiff (GitHub API)
                          ├── runReview (GitAgent SDK)
                          │     ├── code-smell skill
                          │     ├── security-audit skill
                          │     └── review-summary skill
                          ├── postReview (GitHub API)
                          └── db.review.create (PostgreSQL)

Dashboard (/dashboard)
├── GET /api/stats      ── metrics
├── GET /api/reviews    ── recent reviews
└── GET /api/agents/reviewer ── SOUL.md + RULES.md + git log

Feedback loop
├── POST /api/feedback  ── approve / reject comment
├── writeFeedback()     ── append to agent/memory/feedback.md + git commit
└── npm run cron        ── meta-agent proposes rule updates
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Queue | BullMQ + Redis (official `redis` client via `createNodeRedisClient`) |
| AI agent | `@open-gitagent/gitagent` SDK |
| GitHub API | Octokit (`@octokit/rest`) |
| Git operations | `simple-git` |
| Unit tests | Vitest |
| E2E tests | Playwright (Chromium) |

---

## Project structure

```
prism/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents/[id]/     GET agent files, POST save
│   │   │   ├── feedback/        POST approve/reject comment
│   │   │   ├── reviews/         GET list, GET [id]
│   │   │   ├── run/             POST manual trigger
│   │   │   ├── stats/           GET dashboard metrics
│   │   │   └── webhook/         POST GitHub webhook receiver
│   │   ├── agents/[id]/         Agent editor UI
│   │   ├── dashboard/           Metrics + review list
│   │   └── reviews/[prId]/      PR review viewer
│   ├── config/
│   │   ├── prisma.config.ts     Prisma 7 datasource config
│   │   └── redis.config.ts      Official redis client + BullMQ connection
│   ├── cron/
│   │   └── meta-agent.ts        Self-improvement cron script
│   ├── lib/
│   │   ├── crypto.ts            HMAC signature verification
│   │   ├── db.ts                Prisma client singleton
│   │   ├── gitagent.ts          GitAgent SDK wrapper
│   │   ├── github.ts            Octokit + diff fetcher + review poster
│   │   ├── memory.ts            Feedback writer (git commit)
│   │   ├── queue.ts             BullMQ queue definition
│   │   └── worker.ts            BullMQ worker process
│   └── models/
│       ├── agent.ts             Finding, AgentData
│       ├── queue.ts             ReviewJobPayload, FeedbackEntry
│       ├── review.ts            Comment, ReviewSummary, ReviewDetail
│       └── stats.ts             Stats
├── agent/                       GitAgent definition (own git history)
│   ├── agent.yaml               Manifest: model, skills, compliance
│   ├── SOUL.md                  Agent identity and tone
│   ├── RULES.md                 Must-flag / must-never-flag rules
│   ├── DUTIES.md                Role permissions
│   ├── AGENTS.md                Output format instructions
│   ├── memory/feedback.md       Append-only rejection log
│   ├── knowledge/               OWASP Top 10 + antipatterns reference
│   ├── skills/                  code-smell, security-audit, review-summary
│   ├── workflows/review-flow.yaml  Parallel skill execution
│   └── agents/meta-agent/       Sub-agent for rule improvement
├── prisma/schema.prisma         Review, Comment, FeedbackEntry models
└── tests/
    ├── unit/                    Vitest — crypto, github, memory, detect
    └── e2e/                     Playwright — navigation, dashboard, agents
```

---

## Environment variables

Create `.env.local` at the project root:

```env
# PostgreSQL (Prisma Postgres or any pg-compatible URL)
DATABASE_URL=postgresql://user:password@host:5432/prism

# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Anthropic (read by GitAgent SDK automatically)
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=11281
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password

# Agent
AGENT_REPO_PATH=./agent
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

### 2. Set up the database

```bash
npm run db:push
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Start the worker (separate terminal)

```bash
npm run worker
```

### 5. Expose the webhook endpoint

```bash
npx ngrok http 3000
```

Register the ngrok URL + `/api/webhook` as a GitHub webhook on your repository. Select the **Pull requests** event.

---

## Running tests

```bash
# Unit tests (Vitest)
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (Playwright, requires dev server running)
npm run test:e2e

# E2E with interactive UI
npm run test:e2e:ui
```

---

## API reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhook` | GitHub webhook receiver — validates HMAC, enqueues review job |
| `POST` | `/api/run` | Manual trigger — `{ repo, prNum }` |
| `POST` | `/api/feedback` | Approve/reject a comment — `{ commentId, approved, humanEdit? }` |
| `GET` | `/api/stats` | Dashboard metrics |
| `GET` | `/api/reviews` | Recent reviews list |
| `GET` | `/api/reviews/[id]` | Single review with all comments |
| `GET` | `/api/agents/[id]` | Agent SOUL.md, RULES.md, and commit history |
| `POST` | `/api/agents/[id]/save` | Save edited SOUL.md and RULES.md — `{ soul, rules }` |

---

## Agent self-improvement

The meta-agent reads the accumulated rejection log and proposes rule changes when a pattern emerges:

```bash
npm run cron
```

- Exits early if fewer than 3 feedback entries exist
- Groups rejections by `ruleId`
- Calls the meta-agent with the full feedback log + current rules
- Commits proposed diffs to a new branch: `meta-agent/update-{timestamp}`
- A human must review and merge the branch — the agent cannot self-approve

---

## Deployment

### Railway (recommended — everything on one platform)

1. Create a new Railway project
2. Add your GitHub repo as a service (Next.js app, start: `npm start`)
3. Add a second service from the same repo (worker, start: `npm run worker`)
4. Add Redis and PostgreSQL plugins from the Railway dashboard
5. Set all environment variables on both services

### Split stack (free tier)

| Component | Platform |
|---|---|
| Next.js app | Vercel |
| Worker | Render (background worker) |
| Redis | Upstash (free 10k commands/day) |
| PostgreSQL | Prisma Postgres (already configured) |

> **Note:** The agent file writes (`save` endpoint, `writeFeedback`) use the local filesystem and `simple-git`. On Vercel/Render these will need to be migrated to Vercel Blob + GitHub API commits for full compatibility.

---

## CI

GitHub Actions runs on every push and pull request:

- Validates `agent/agent.yaml` parses correctly
- Validates `agent/agents/meta-agent/agent.yaml` parses correctly
- Checks all required agent files are present

See `.github/workflows/agent-ci.yml`.
