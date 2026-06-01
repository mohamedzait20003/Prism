import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { invalidateWorkerCache } from "@/lib/agent-config";

type Action = "approve" | "reject";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { proposalId } = await params;
  const { action } = await req.json() as { action: Action };

  const proposal = await db.proposedRuleUpdate.findUnique({ where: { id: proposalId } });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (proposal.status !== "PENDING") {
    return NextResponse.json({ error: "Proposal already actioned" }, { status: 409 });
  }

  if (action === "approve") {
    await db.$transaction(async (tx) => {
      if (proposal.proposedRules) {
        await tx.agentConfig.upsert({
          where: { key: "rules" },
          create: { key: "rules", content: proposal.proposedRules, updatedBy: session.user.id },
          update: { content: proposal.proposedRules, updatedBy: session.user.id },
        });
      }

      if (proposal.proposedSoul) {
        await tx.agentConfig.upsert({
          where: { key: "soul" },
          create: { key: "soul", content: proposal.proposedSoul, updatedBy: session.user.id },
          update: { content: proposal.proposedSoul, updatedBy: session.user.id },
        });
      }
      
      await tx.proposedRuleUpdate.update({
        where: { id: proposalId },
        data: { status: "APPROVED", reviewedBy: session.user.id, reviewedAt: new Date() },
      });
    });

    revalidateTag("agent-config", "default");
    invalidateWorkerCache();
  } else {
    await db.proposedRuleUpdate.update({
      where: { id: proposalId },
      data: { status: "REJECTED", reviewedBy: session.user.id, reviewedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
