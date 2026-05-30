import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { writeFileSync } from "fs";
import { resolve, join } from "path";


const isDev = process.env.IS_DEVELOPMENT === "true";

async function saveLocal(soul: string, rules: string): Promise<void> {
  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
  writeFileSync(join(agentRoot, "SOUL.md"), soul, "utf-8");
  writeFileSync(join(agentRoot, "RULES.md"), rules, "utf-8");
}

async function saveGitHub(soul: string, rules: string): Promise<void> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = (process.env.GITHUB_REPO ?? "").split("/");

  async function updateFile(path: string, content: string, message: string) {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    const file = data as { sha: string };
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha: file.sha,
    });
  }

  await Promise.all([
    updateFile("agent/SOUL.md", soul, "update: SOUL.md via PRism dashboard"),
    updateFile("agent/RULES.md", rules, "update: RULES.md via PRism dashboard"),
  ]);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id !== "reviewer") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { soul, rules } = await req.json() as { soul: string; rules: string };

  if (isDev) {
    await saveLocal(soul, rules);
  } else {
    await saveGitHub(soul, rules);
  }

  return NextResponse.json({ ok: true });
}
