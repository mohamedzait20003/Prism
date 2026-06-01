import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const review = await db.review.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      repo: { select: { fullName: true } },
    },
  });

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: review.id,
    repo: review.repo?.fullName ?? "unknown",
    prNum: review.prNum,
    sha: review.sha,
    agentVer: review.agentVer,
    createdAt: review.createdAt.toISOString(),
    comments: review.comments.map((c) => ({
      id: c.id,
      file: c.file,
      line: c.line,
      message: c.message,
      severity: c.severity,
      ruleId: c.ruleId,
      approved: c.approved,
      humanEdit: c.humanEdit,
    })),
  });
}
