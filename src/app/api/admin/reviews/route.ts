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

  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      _count: { select: { comments: true } },
      repo: { select: { fullName: true, profile: { select: { githubLogin: true } } } },
    },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      repo: r.repo?.fullName ?? "unknown",
      owner: r.repo?.profile?.githubLogin ?? "unknown",
      prNum: r.prNum,
      commentCount: r._count.comments,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
