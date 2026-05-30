import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { resolve, join } from "path";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalReviews, totalComments, approvedComments, feedbackedComments, topRules] =
    await Promise.all([
      db.review.count(),
      db.comment.count(),
      db.comment.count({ where: { approved: true } }),
      db.comment.count({ where: { approved: { not: null } } }),
      db.feedbackEntry.groupBy({
        by: ["ruleId"],
        _count: { ruleId: true },
        orderBy: { _count: { ruleId: "desc" } },
        take: 5,
      }),
    ]);

  let feedbackCount = 0;
  try {
    const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
    const content = await readFile(join(agentRoot, "memory", "feedback.md"), "utf-8");
    feedbackCount = (content.match(/^## PR #/gm) ?? []).length;
  } catch {
    // feedback.md not yet written
  }

  return NextResponse.json({
    totalReviews,
    totalComments,
    approvalRate:
      feedbackedComments > 0
        ? Math.round((approvedComments / feedbackedComments) * 100)
        : null,
    feedbackCount,
    topRules: topRules.map((r) => ({ ruleId: r.ruleId, count: r._count.ruleId })),
  });
}
