import { Queue } from "bullmq";
import { connection } from "@/config/redis.config";
import type { ReviewJobPayload } from "@/models";

export type { ReviewJobPayload };

export const reviewQueue = new Queue<ReviewJobPayload>("review-pr", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
