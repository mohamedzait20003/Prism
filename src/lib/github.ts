import { Octokit } from "@octokit/rest";
import type { Finding } from "@/models";

export type { Finding };

export function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export function parseRepo(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}

export async function fetchDiff(diffUrl: string, token: string): Promise<string> {
  const res = await fetch(diffUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3.diff",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch diff: ${res.status}`);
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
  findings: Finding[],
  token: string
): Promise<void> {
  if (findings.length === 0) return;
  const client = getOctokit(token);
  await client.pulls.createReview({
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

export async function registerWebhook(
  owner: string,
  repo: string,
  token: string,
  webhookUrl: string,
  secret: string
): Promise<number> {
  const client = getOctokit(token);
  const { data } = await client.repos.createWebhook({
    owner,
    repo,
    config: { url: webhookUrl, content_type: "json", secret, insecure_ssl: "0" },
    events: ["pull_request"],
    active: true,
  });
  return data.id;
}

export async function deleteWebhook(
  owner: string,
  repo: string,
  githubWebhookId: number,
  token: string
): Promise<void> {
  const client = getOctokit(token);
  await client.repos.deleteWebhook({ owner, repo, hook_id: githubWebhookId });
}

export async function listUserRepos(
  token: string
): Promise<{ fullName: string; private: boolean; canAdmin: boolean }[]> {
  const client = getOctokit(token);
  const { data } = await client.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });
  return data.map((r) => ({
    fullName: r.full_name,
    private: r.private,
    canAdmin: r.permissions?.admin ?? false,
  }));
}
