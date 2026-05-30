import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFeedback } from "@/lib/memory";

export async function POST(req: NextRequest) {
  const { commentId, approved, humanEdit } = await req.json() as {
    commentId: string;
    approved: boolean;
    humanEdit?: string;
  };

  const comment = await db.$transaction(async (tx) => {
    const updated = await tx.comment.update({
      where: { id: commentId },
      data: { approved, humanEdit: humanEdit ?? null },
      include: { review: true },
    });

    if (!approved) {
      await tx.feedbackEntry.create({
        data: {
          prNum: updated.review.prNum,
          repo: updated.review.repo,
          file: updated.file,
          line: updated.line,
          agentComment: updated.message,
          humanEdit: humanEdit ?? null,
          ruleId: updated.ruleId,
        },
      });
    }

    return updated;
  });

  if (!approved) {
    await writeFeedback({
      prNum: comment.review.prNum,
      repo: comment.review.repo,
      file: comment.file,
      line: comment.line,
      ruleId: comment.ruleId ?? "unknown",
      agentComment: comment.message,
      humanEdit: humanEdit ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
