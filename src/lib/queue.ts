import { Queue } from "bullmq";

export interface ReviewJobPayload {
  repo: string;
  prNum: number;
  sha: string;
  diffUrl: string;
  agentRepo: string;
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

export const reviewQueue = new Queue<ReviewJobPayload>("review-pr", {
  connection: redisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
