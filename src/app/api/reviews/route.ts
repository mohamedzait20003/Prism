import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { _count: { select: { comments: true } } },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      repo: r.repo,
      prNum: r.prNum,
      commentCount: r._count.comments,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
