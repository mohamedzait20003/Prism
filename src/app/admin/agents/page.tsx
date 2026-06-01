import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AgentView } from "@/components/admin/agent-view";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface Proposal {
  id: string;
  proposedSoul: string | null;
  proposedRules: string | null;
  reasoning: string;
  createdAt: string;
}

export default async function AdminAgentsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") 
    redirect("/client/dashboard");

  const cookieStore = await cookies();
  const h = { Cookie: cookieStore.toString() };

  const [agentRes, proposalsRes] = await Promise.all([
    fetch(`${BASE}/api/admin/agents/reviewer`, { cache: "no-store", headers: h }),
    fetch(`${BASE}/api/admin/agents/reviewer/proposals`, { cache: "no-store", headers: h }),
  ]);

  if (!agentRes.ok) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Failed to load agent config.</p>
    </div>
  );

  const { soul, rules } = await agentRes.json() as { soul: string; rules: string; commits: unknown[] };
  const proposals: Proposal[] = proposalsRes.ok ? await proposalsRes.json() : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Agent Rules</h1>
          <p className="text-muted-foreground mt-2">
            Current SOUL and RULES — read-only. Click a proposal on the right to preview its changes.
          </p>
        </div>
        <AgentView
          soul={soul}
          rules={rules}
          proposals={proposals}
          agentId="reviewer"
        />
      </div>
    </div>
  );
}
