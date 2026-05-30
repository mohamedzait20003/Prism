import { Octokit } from "@octokit/rest";
import type { Finding } from "@/app/models";

export type { Finding };

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export function parseRepo(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}

export async function fetchDiff(diffUrl: string): Promise<string> {
  const res = await fetch(diffUrl, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.diff",
    },
  });

  if (!res.ok) 
    throw new Error(`Failed to fetch diff: ${res.status}`);
  
  return res.text();
}

const severityIcon: Record<Finding["severity"], string> = {
  error: "🔴",
  warning: "🟡",
  info: "🔵",
};

export async function postReview(
  owner: string,
  repo: string,
  prNum: number,
  sha: string,
  findings: Finding[]
): Promise<void> {
  if (findings.length === 0) return;

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: prNum,
    commit_id: sha,
    event: "COMMENT",
    comments: findings.map((f) => ({
      path: f.file,
      line: f.line,
      body: `${severityIcon[f.severity]} \`${f.ruleId}\` — ${f.message}`,
    })),
  });
}
