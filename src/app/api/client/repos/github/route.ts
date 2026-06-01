import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { db } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { listUserRepos } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.clientProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No GitHub profile connected" }, { status: 400 });

  const token = decrypt(profile.githubToken);
  return NextResponse.json(await listUserRepos(token));
}
