import { resolve } from "path";
import simpleGit from "simple-git";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getAgentConfigFromDB } from "@/lib/agent-config";

export const dynamic = "force-dynamic";

const getCachedAgentConfig = unstable_cache(
  getAgentConfigFromDB,
  ["agent-config"],
  { revalidate: 60, tags: ["agent-config"] }
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id !== "reviewer")
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { soul, rules } = await getCachedAgentConfig();

  let commits: { hash: string; message: string; date: string }[] = [];
  try {
    const git = simpleGit(resolve(process.cwd()));
    const log = await git.log({ file: "src/agent", maxCount: 10 });
    commits = log.all.map((c) => ({
      hash: c.hash.slice(0, 7),
      message: c.message,
      date: c.date,
    }));
  } catch {
    // no git history
  }

  return NextResponse.json({ soul, rules, commits });
}
