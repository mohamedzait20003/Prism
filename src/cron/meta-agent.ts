import { config } from "dotenv";
import { resolve, join } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { runMetaAgentQuery } from "../lib/gitagent";

const AGENT_REPO_PATH = resolve(process.env.AGENT_REPO_PATH ?? "./src/agent");
const META_AGENT_DIR = join(AGENT_REPO_PATH, "agents", "meta-agent");

async function main() {
  const entries = await db.feedbackEntry.findMany({
    orderBy: { createdAt: "asc" },
    include: { connectedRepo: { select: { fullName: true } } },
  });

  if (entries.length < 3) {
    console.log(`[meta-agent] Only ${entries.length} feedback entries — need at least 3. Exiting.`);
    return;
  }

  const [soulRow, rulesRow] = await Promise.all([
    db.agentConfig.findUnique({ where: { key: "soul" } }),
    db.agentConfig.findUnique({ where: { key: "rules" } }),
  ]);

  const feedbackText = entries
    .map(
      (e) =>
        `## PR #${e.prNum} — ${e.createdAt.toISOString()}\n` +
        `- **Repo:** ${e.connectedRepo?.fullName ?? "unknown"}\n` +
        `- **File:** ${e.file}:${e.line}\n` +
        `- **Rule:** ${e.ruleId ?? "unknown"}\n` +
        `- **Agent said:** ${e.agentComment}\n` +
        `- **Human correction:** ${e.humanEdit ?? "Dismissed"}`
    )
    .join("\n\n");

  const prompt = `You are a prompt engineer improving an AI code reviewer's rules.

Below is the accumulated feedback log, current RULES, and current SOUL.

Analyse the feedback, identify rules generating false positives (rejected 3+ times), and propose minimal changes.

Return ONLY a JSON object — no prose, no markdown:
{
  "reasoning": "string explaining what patterns you found and why you are proposing changes",
  "rules": "full updated RULES content if changes needed, or null",
  "soul": "full updated SOUL content if changes needed, or null"
}

--- FEEDBACK LOG ---
${feedbackText}

--- CURRENT RULES ---
${rulesRow?.content ?? ""}

--- CURRENT SOUL ---
${soulRow?.content ?? ""}`;

  console.log(`[meta-agent] Running on ${entries.length} feedback entries…`);
  const raw = await runMetaAgentQuery(META_AGENT_DIR, prompt);

  let result: { reasoning: string; rules: string | null; soul: string | null };
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object in response");
    result = JSON.parse(match[0]);
  } catch (err) {
    console.error("[meta-agent] Failed to parse response:", err);
    return;
  }

  if (!result.rules && !result.soul) {
    console.log("[meta-agent] No changes proposed.");
    console.log("Reasoning:", result.reasoning);
    return;
  }

  const proposal = await db.proposedRuleUpdate.create({
    data: {
      proposedSoul:  result.soul  ?? null,
      proposedRules: result.rules ?? null,
      reasoning:     result.reasoning,
    },
  });

  console.log(`[meta-agent] Proposal created (id: ${proposal.id}) — awaiting admin review.`);
  console.log("Reasoning:", result.reasoning);
  if (result.rules) console.log("— RULES change proposed");
  if (result.soul)  console.log("— SOUL change proposed");
}

main().catch((err) => {
  console.error("[meta-agent] Fatal:", err);
  process.exit(1);
});
