import { NextRequest, NextResponse } from "next/server";
import { reviewQueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  const { repo, prNum } = await req.json() as { repo: string; prNum: number };

  await reviewQueue.add("review", {
    repo,
    prNum,
    sha: "HEAD",
    diffUrl: `https://github.com/${repo}/pull/${prNum}.diff`,
    agentRepo: process.env.AGENT_REPO_PATH ?? "./agent",
  });

  return NextResponse.json({ queued: true });
}
