import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { resolve, join } from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id !== "reviewer") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { soul, rules } = await req.json() as { soul: string; rules: string };
  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");

  writeFileSync(join(agentRoot, "SOUL.md"), soul, "utf-8");
  writeFileSync(join(agentRoot, "RULES.md"), rules, "utf-8");

  return NextResponse.json({ ok: true });
}
