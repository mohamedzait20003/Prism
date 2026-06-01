import { createHash, randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encrypt";
import { registerWebhook, parseRepo } from "@/lib/github";

export const dynamic = "force-dynamic";

async function getProfile(userId: string) {
  return db.clientProfile.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "No GitHub profile connected" }, { status: 400 });

  const repos = await db.connectedRepo.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fullName: true, active: true, createdAt: true },
  });

  return NextResponse.json(repos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "No GitHub profile connected" }, { status: 400 });

  const { fullName } = await req.json() as { fullName: string };
  const token = decrypt(profile.githubToken);
  const { owner, repo } = parseRepo(fullName);

  const webhookUrlId = randomUUID();
  const webhookSecret = randomBytes(32).toString("hex");
  const webhookIdHash = createHash("sha256").update(webhookUrlId).digest("hex");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let githubWebhookId: number | null = null;
  try {
    githubWebhookId = await registerWebhook(owner, repo, token, `${appUrl}/api/webhook/${webhookUrlId}`, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to register webhook";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const connected = await db.connectedRepo.create({
    data: { profileId: profile.id, fullName, githubWebhookId, webhookIdHash, webhookSecret: encrypt(webhookSecret) },
  });

  return NextResponse.json({ id: connected.id, fullName: connected.fullName }, { status: 201 });
}
