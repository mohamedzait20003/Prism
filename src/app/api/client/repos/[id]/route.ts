import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { deleteWebhook, parseRepo } from "@/lib/github";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const repo = await db.connectedRepo.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!repo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = repo.profile.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (repo.githubWebhookId) {
    try {
      const token = decrypt(repo.profile.githubToken);
      const { owner, repo: repoName } = parseRepo(repo.fullName);
      await deleteWebhook(owner, repoName, repo.githubWebhookId, token);
    } catch { /* already deleted */ }
  }

  await db.connectedRepo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
