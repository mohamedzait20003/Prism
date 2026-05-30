import { Queue } from "bullmq";
import { connection } from "@/config/redis.config";

export interface ReviewJobPayload {
  repo: string;
  prNum: number;
  sha: string;
  diffUrl: string;
  agentRepo: string;
}

export const reviewQueue = new Queue<ReviewJobPayload>("review-pr", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
