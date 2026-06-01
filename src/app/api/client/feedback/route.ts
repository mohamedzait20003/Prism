import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { commentId, approved, humanEdit } = await req.json() as {
    commentId: string;
    approved: boolean;
    humanEdit?: string;
  };

  await db.$transaction(async (tx) => {
    const updated = await tx.comment.update({
      where: { id: commentId },
      data: { approved, humanEdit: humanEdit ?? null },
      include: { review: true },
    });

    if (!approved) {
      const profile = session?.user?.id ? await tx.clientProfile.findUnique({ where: { userId: session.user.id } }) : null;

      await tx.feedbackEntry.create({
        data: {
          prNum: updated.review.prNum,
          file: updated.file,
          line: updated.line,
          agentComment: updated.message,
          humanEdit: humanEdit ?? null,
          ruleId: updated.ruleId,
          profileId: profile?.id ?? null,
          repoId: updated.review.repoId,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
