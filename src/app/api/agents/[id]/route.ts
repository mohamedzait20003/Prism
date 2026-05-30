import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve, join } from "path";
import simpleGit from "simple-git";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id !== "reviewer") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");

  const [soul, rules] = await Promise.all([
    readFile(join(agentRoot, "SOUL.md"), "utf-8"),
    readFile(join(agentRoot, "RULES.md"), "utf-8"),
  ]);

  let commits: { hash: string; message: string; date: string }[] = [];
  try {
    const git = simpleGit(resolve(process.cwd()));
    const log = await git.log({ file: "agent", maxCount: 10 });
    commits = log.all.map((c) => ({ hash: c.hash.slice(0, 7), message: c.message, date: c.date }));
  } catch {
    // no git history yet
  }

  return NextResponse.json({ soul, rules, commits });
}
