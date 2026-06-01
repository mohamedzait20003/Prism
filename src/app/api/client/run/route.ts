import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewQueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  const { repo, prNum } = await req.json() as { repo: string; prNum: number };

  // Resolve the ConnectedRepo.id if this repo is linked
  const connected = await db.connectedRepo.findFirst({
    where: { fullName: repo, active: true },
    select: { id: true },
  });

  await reviewQueue.add("review", {
    repoFullName: repo,
    repoId: connected?.id,
    prNum,
    sha: "HEAD",
    diffUrl: `https://github.com/${repo}/pull/${prNum}.diff`,
    agentRepo: process.env.AGENT_REPO_PATH ?? "./agent",
  });

  return NextResponse.json({ queued: true });
}
