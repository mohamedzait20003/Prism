import { resolve, join } from "path";
import { appendFile } from "fs/promises";
import simpleGit from "simple-git";
import { Octokit } from "@octokit/rest";
import type { FeedbackEntry } from "@/models";

export type { FeedbackEntry };

const isDev = () => process.env.IS_DEVELOPMENT === "true";

function buildBlock(entry: FeedbackEntry): string {
  const timestamp = new Date().toISOString();
  const correction = entry.humanEdit ?? "Dismissed";
  return `
    ## PR #${entry.prNum} — ${timestamp}

    - **Repo:** ${entry.repo}
    - **File:** ${entry.file}:${entry.line}
    - **Rule:** ${entry.ruleId}
    - **Agent said:** ${entry.agentComment}
    - **Human correction:** ${correction}
  `;
}

async function writeFeedbackLocal(entry: FeedbackEntry): Promise<void> {
  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
  const feedbackPath = join(agentRoot, "memory", "feedback.md");
  await appendFile(feedbackPath, buildBlock(entry), "utf-8");
  const git = simpleGit(agentRoot);
  await git.add("memory/feedback.md");
  await git.commit(`feedback: rejected comment on PR #${entry.prNum} (${entry.repo})`);
}

async function writeFeedbackGitHub(entry: FeedbackEntry): Promise<void> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = (process.env.GITHUB_REPO ?? "").split("/");
  const path = "agent/memory/feedback.md";

  const { data } = await octokit.repos.getContent({ owner, repo, path });
  const file = data as { content: string; sha: string };
  const current = Buffer.from(file.content, "base64").toString("utf-8");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `feedback: rejected comment on PR #${entry.prNum} (${entry.repo})`,
    content: Buffer.from(current + buildBlock(entry)).toString("base64"),
    sha: file.sha,
  });
}

export async function writeFeedback(entry: FeedbackEntry): Promise<void> {
  if (isDev()) {
    await writeFeedbackLocal(entry);
  } else {
    await writeFeedbackGitHub(entry);
  }
}
