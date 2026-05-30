import { notFound } from "next/navigation";
import { AgentEditor } from "./agent-editor";
import type { AgentData } from "@/models";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const AgentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const res = await fetch(`${BASE}/api/agents/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const { soul, rules, commits }: AgentData = await res.json();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <h1 className="text-2xl font-semibold text-gray-100">
        Agent <span className="text-indigo-400">{id}</span>
      </h1>

      <AgentEditor id={id} initialSoul={soul} initialRules={rules} />

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-400 uppercase tracking-wide">Agent History</h2>
        {commits.length === 0 ? (
          <p className="text-gray-600 text-sm">No commits yet.</p>
        ) : (
          <ol className="space-y-2">
            {commits.map((c) => (
              <li key={c.hash} className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
                <span className="font-mono text-xs text-gray-600 shrink-0 mt-0.5">{c.hash}</span>
                <span className="text-sm text-gray-300 flex-1">{c.message}</span>
                <span className="text-xs text-gray-600 shrink-0">{new Date(c.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default AgentPage;
