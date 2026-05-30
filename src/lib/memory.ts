import { resolve, join } from "path";
import { appendFile } from "fs/promises";
import simpleGit from "simple-git";
import type { FeedbackEntry } from "@/app/models";

export type { FeedbackEntry };

export async function writeFeedback(entry: FeedbackEntry): Promise<void> {
  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
  const feedbackPath = join(agentRoot, "memory", "feedback.md");
  const timestamp = new Date().toISOString();
  const correction = entry.humanEdit ?? "Dismissed";

  const block = `
    ## PR #${entry.prNum} — ${timestamp}

    - **Repo:** ${entry.repo}
    - **File:** ${entry.file}:${entry.line}
    - **Rule:** ${entry.ruleId}
    - **Agent said:** ${entry.agentComment}
    - **Human correction:** ${correction}
  `;

  await appendFile(feedbackPath, block, "utf-8");

  const git = simpleGit(agentRoot);
  await git.add("memory/feedback.md");
  await git.commit(`feedback: rejected comment on PR #${entry.prNum} (${entry.repo})`);
}
