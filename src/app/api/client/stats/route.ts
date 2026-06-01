import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdmin = req.nextUrl.searchParams.get("admin") === "true" && session?.user?.role === "ADMIN";

  let repoIds: string[] | null = null;
  if (!isAdmin && session?.user?.id) {
    const profile = await db.clientProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) {
      const repos = await db.connectedRepo.findMany({ where: { profileId: profile.id }, select: { id: true } });
      repoIds = repos.map((r) => r.id);
    }
  }

  const repoFilter = repoIds ? { repoId: { in: repoIds } } : {};

  const [totalReviews, totalComments, approvedComments, feedbackedComments, topRules, feedbackCount] =
    await Promise.all([
      db.review.count({ where: repoFilter }),
      db.comment.count({ where: { review: repoFilter } }),
      db.comment.count({ where: { review: repoFilter, approved: true } }),
      db.comment.count({ where: { review: repoFilter, approved: { not: null } } }),
      db.feedbackEntry.groupBy({
        by: ["ruleId"],
        where: repoIds ? { repoId: { in: repoIds } } : {},
        _count: { ruleId: true },
        orderBy: { _count: { ruleId: "desc" } },
        take: 5,
      }),
      db.feedbackEntry.count({ where: repoIds ? { repoId: { in: repoIds } } : {} }),
    ]);

  return NextResponse.json({
    totalReviews,
    totalComments,
    approvalRate: feedbackedComments > 0 ? Math.round((approvedComments / feedbackedComments) * 100) : null,
    feedbackCount,
    topRules: topRules.map((r) => ({ ruleId: r.ruleId, count: r._count.ruleId })),
  });
}
