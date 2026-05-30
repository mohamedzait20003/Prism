import { Queue } from "bullmq";

export interface ReviewJobPayload {
  repo: string;
  prNum: number;
  sha: string;
  diffUrl: string;
  agentRepo: string;
}

function redisConnection() {
  return {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    username: process.env.REDIS_USERNAME ?? "default",
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null as null,
    tls: process.env.REDIS_HOST ? {} : undefined,
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
