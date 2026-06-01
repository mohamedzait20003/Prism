import yaml from "yaml";
import { config } from "dotenv";
import { Worker } from "bullmq";
import { readFileSync } from "fs";
import { resolve, join } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "./db";
import { runReview } from "./gitagent";
import type { ReviewJobPayload } from "./queue";
import { connection } from "../config/redis.config";
import { getAgentConfigCached } from "./agent-config";
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

const worker = new Worker<ReviewJobPayload>("review-pr", async (job) => {
    const { repoFullName, repoId, prNum, sha, diffUrl, githubToken } = job.data;
    
    if (!githubToken) 
      throw new Error(`No GitHub token for repo ${repoFullName}`);
    
    const { owner, repo: repoName } = parseRepo(repoFullName);
    const agentVer = getAgentVersion();

    const agentConfig = await getAgentConfigCached(); // TTL-cached — max 1 DB hit per 5 min

    const diff = await fetchDiff(diffUrl, githubToken);
    const findings = await runReview(AGENT_REPO_PATH, diff, agentConfig);

    await postReview(owner, repoName, prNum, sha, findings, githubToken);

    await db.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          prNum,
          sha,
          agentVer,
          repoId,
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
    });
  },
  { connection, concurrency: 3 }
);

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} completed — PR #${job.data.prNum} (${job.data.repoFullName})`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

console.log("Listening for review jobs...");
