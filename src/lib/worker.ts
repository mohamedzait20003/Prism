import yaml from "yaml";
import { config } from "dotenv";
import { Worker } from "bullmq";
import { readFileSync } from "fs";
import { resolve, join } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "./db";
import { runReview } from "./gitagent";
import type { ReviewJobPayload } from "./queue";
import { fetchDiff, postReview, parseRepo } from "./github";

const AGENT_REPO_PATH = resolve(process.env.AGENT_REPO_PATH ?? "./agent");

function getAgentVersion(): string {
  try {
    const raw = readFileSync(join(AGENT_REPO_PATH, "agent.yaml"), "utf-8");
    const manifest = yaml.parse(raw) as { version?: string };
    return manifest.version ?? "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function redisConnection() {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    password: url.password || undefined,
    maxRetriesPerRequest: null as null,
  };
}

const worker = new Worker<ReviewJobPayload>(
  "review-pr",
  async (job) => {
    const { repo, prNum, sha, diffUrl } = job.data;
    const { owner, repo: repoName } = parseRepo(repo);
    const agentVer = getAgentVersion();

    const diff = await fetchDiff(diffUrl);
    const findings = await runReview(AGENT_REPO_PATH, diff);

    await postReview(owner, repoName, prNum, sha, findings);

    await db.review.create({
      data: {
        prNum,
        repo,
        sha,
        agentVer,
        comments: {
          create: findings.map((f) => ({
            file: f.file,
            line: f.line,
            message: f.message,
            severity: f.severity,
            ruleId: f.ruleId,
          })),
        },
      },
    });
  },
  { connection: redisConnection(), concurrency: 3 }
);

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} completed — PR #${job.data.prNum} (${job.data.repo})`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

console.log("Listening for review jobs...");
