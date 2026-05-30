import { readFile } from "fs/promises";
import { resolve, join } from "path";
import { notFound } from "next/navigation";
import simpleGit from "simple-git";

import { AgentEditor } from "./agent-editor";

export const dynamic = "force-dynamic";

async function readAgentFile(agentRoot: string, filename: string): Promise<string> {
  return readFile(join(agentRoot, filename), "utf-8");
}

async function getAgentLog() {
  try {
    const git = simpleGit(resolve(process.cwd()));
    const log = await git.log({ file: "agent", maxCount: 10 });
    return log.all;
  } catch {
    return [];
  }
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id !== "reviewer") notFound();

  const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");

  const [soul, rules, commits] = await Promise.all([
    readAgentFile(agentRoot, "SOUL.md"),
    readAgentFile(agentRoot, "RULES.md"),
    getAgentLog(),
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <h1 className="text-2xl font-semibold text-gray-100">
        Agent <span className="text-indigo-400">reviewer</span>
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
                <span className="font-mono text-xs text-gray-600 shrink-0 mt-0.5">{c.hash.slice(0, 7)}</span>
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
