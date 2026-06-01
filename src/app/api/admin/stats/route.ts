import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalReviews,
    totalComments,
    approvedComments,
    feedbackedComments,
    topRules,
    feedbackCount,
    totalClients,
    totalConnectedRepos,
  ] = await Promise.all([
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
    db.feedbackEntry.count(),
    db.user.count({ where: { role: "CLIENT" } }),
    db.connectedRepo.count({ where: { active: true } }),
  ]);

  return NextResponse.json({
    totalReviews,
    totalComments,
    approvalRate: feedbackedComments > 0
      ? Math.round((approvedComments / feedbackedComments) * 100)
      : null,
    feedbackCount,
    totalClients,
    totalConnectedRepos,
    topRules: topRules.map((r) => ({ ruleId: r.ruleId, count: r._count.ruleId })),
  });
}
