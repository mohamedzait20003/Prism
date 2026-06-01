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

  const where = repoIds ? { repoId: { in: repoIds } } : {};

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { comments: true } },
      repo: { select: { fullName: true } },
    },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      repo: r.repo?.fullName ?? "unknown",
      prNum: r.prNum,
      commentCount: r._count.comments,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
