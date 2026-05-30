import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { readFile } from "fs/promises";
import { resolve, join } from "path";
import simpleGit from "simple-git";


export const dynamic = "force-dynamic";

const isDev = process.env.IS_DEVELOPMENT === "true";

async function getCommitsLocal() {
  try {
    const git = simpleGit(resolve(process.cwd()));
    const log = await git.log({ file: "agent", maxCount: 10 });
    return log.all.map((c) => ({
      hash: c.hash.slice(0, 7),
      message: c.message,
      date: c.date,
    }));
  } catch {
    return [];
  }
}

async function getCommitsGitHub() {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const [owner, repo] = (process.env.GITHUB_REPO ?? "").split("/");
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      path: "agent",
      per_page: 10,
    });
    return data.map((c) => ({
      hash: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      date: c.commit.author?.date ?? "",
    }));
  } catch {
    return [];
  }
}

async function readAgentFileLocal(agentRoot: string, filename: string) {
  return readFile(join(agentRoot, filename), "utf-8");
}

async function readAgentFileGitHub(filename: string) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = (process.env.GITHUB_REPO ?? "").split("/");
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: `agent/${filename}`,
  });
  const file = data as { content: string };
  return Buffer.from(file.content, "base64").toString("utf-8");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id !== "reviewer") return NextResponse.json({ error: "Not found" }, { status: 404 });

  let soul: string;
  let rules: string;
  let commits: { hash: string; message: string; date: string }[];

  if (isDev) {
    const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
    [soul, rules, commits] = await Promise.all([
      readAgentFileLocal(agentRoot, "SOUL.md"),
      readAgentFileLocal(agentRoot, "RULES.md"),
      getCommitsLocal(),
    ]);
  } else {
    [soul, rules, commits] = await Promise.all([
      readAgentFileGitHub("SOUL.md"),
      readAgentFileGitHub("RULES.md"),
      getCommitsGitHub(),
    ]);
  }

  return NextResponse.json({ soul, rules, commits });
}
