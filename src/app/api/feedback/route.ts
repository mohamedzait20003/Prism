import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFeedback } from "@/lib/memory";

export async function POST(req: NextRequest) {
  const { commentId, approved, humanEdit } = await req.json() as {
    commentId: string;
    approved: boolean;
    humanEdit?: string;
  };

  const comment = await db.comment.update({
    where: { id: commentId },
    data: { approved, humanEdit: humanEdit ?? null },
    include: { review: true },
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

    await db.feedbackEntry.create({
      data: {
        prNum: comment.review.prNum,
        repo: comment.review.repo,
        file: comment.file,
        line: comment.line,
        agentComment: comment.message,
        humanEdit: humanEdit ?? null,
        ruleId: comment.ruleId,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
