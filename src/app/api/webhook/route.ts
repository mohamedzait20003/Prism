import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { reviewQueue } from "@/lib/queue";

const IGNORED_ACTIONS = new Set(["closed", "merged", "labeled", "unlabeled", "assigned"]);

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) 
    return false;
  
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event !== "pull_request") {
    return NextResponse.json({ skipped: true });
  }

  const payload = JSON.parse(body);
  const action: string = payload.action;

  if (IGNORED_ACTIONS.has(action)) {
    return NextResponse.json({ skipped: true });
  }

  const pr = payload.pull_request;
  const repo: string = payload.repository.full_name;

  await reviewQueue.add("review", {
    repo,
    prNum: pr.number,
    sha: pr.head.sha,
    diffUrl: pr.diff_url,
    agentRepo: process.env.AGENT_REPO_PATH ?? "./agent",
  });

  return NextResponse.json({ queued: true });
}
