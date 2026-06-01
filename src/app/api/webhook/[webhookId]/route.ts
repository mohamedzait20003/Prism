import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { verifyHmacSignature } from "@/lib/crypto";
import { reviewQueue } from "@/lib/queue";

const IGNORED = new Set(["closed", "merged", "labeled", "unlabeled", "assigned"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const { webhookId } = await params;
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  const webhookIdHash = createHash("sha256").update(webhookId).digest("hex");

  const repo = await db.connectedRepo.findUnique({
    where: { webhookIdHash },
    include: { profile: true },
  });

  if (!repo || !repo.active) 
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const webhookSecret = decrypt(repo.webhookSecret);
  if (!verifyHmacSignature(body, signature, webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (event !== "pull_request") 
    return NextResponse.json({ skipped: true });

  const payload = JSON.parse(body);
  if (IGNORED.has(payload.action)) 
    return NextResponse.json({ skipped: true });

  const pr = payload.pull_request;
  const githubToken = decrypt(repo.profile.githubToken);

  await reviewQueue.add("review", {
    repoFullName: repo.fullName,
    repoId: repo.id,
    prNum: pr.number,
    sha: pr.head.sha,
    diffUrl: pr.diff_url,
    agentRepo: process.env.AGENT_REPO_PATH ?? "./agent",
    githubToken,
  });

  return NextResponse.json({ queued: true });
}
