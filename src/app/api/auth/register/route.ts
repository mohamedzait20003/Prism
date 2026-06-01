import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user.service";

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json() as {
    email: string;
    username: string;
    password: string;
  };

  if (!email || !username || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const existing = await userService.findByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  // Registration always creates CLIENT accounts.
  // Admins must be promoted via scripts/make-admin.ts or by an existing admin.
  await userService.createWithPassword({ email, username, password, role: "CLIENT" });
  return NextResponse.json({ ok: true }, { status: 201 });
}
