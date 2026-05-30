import { config } from "dotenv";
import { resolve, join } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { readFile, writeFile } from "fs/promises";
import simpleGit from "simple-git";
import { runMetaAgentQuery } from "../lib/gitagent";

const AGENT_REPO_PATH = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
const META_AGENT_DIR = join(AGENT_REPO_PATH, "agents", "meta-agent");

async function readAgentFile(filename: string): Promise<string> {
  return readFile(join(AGENT_REPO_PATH, filename), "utf-8");
}

function countFeedbackEntries(feedbackMd: string): number {
  return (feedbackMd.match(/^## PR #/gm) ?? []).length;
}

async function main() {
  const feedbackMd = await readAgentFile("memory/feedback.md");
  const entryCount = countFeedbackEntries(feedbackMd);

  if (entryCount < 3) {
    console.log(`[meta-agent] Only ${entryCount} feedback entries — need at least 3. Exiting.`);
    return;
  }

  const rulesMd = await readAgentFile("RULES.md");
  const soulMd = await readAgentFile("SOUL.md");

  const prompt = `You are a prompt engineer improving an AI code reviewer's rules.

Below is the accumulated feedback log, current RULES.md, and current SOUL.md.

Analyse the feedback, identify rules that are generating false positives (rejected 3+ times), and propose minimal changes.

Return ONLY a JSON object in this exact shape — no prose, no markdown:
{
  "reasoning": "string explaining what patterns you found and why you are proposing changes",
  "rules_diff": "unified diff to apply to RULES.md, or null",
  "soul_diff": "unified diff to apply to SOUL.md, or null"
}

--- FEEDBACK LOG ---
${feedbackMd}

--- RULES.md ---
${rulesMd}

--- SOUL.md ---
${soulMd}`;

  console.log(`[meta-agent] Running meta-agent on ${entryCount} feedback entries...`);
  const raw = await runMetaAgentQuery(META_AGENT_DIR, prompt);

  let result: { reasoning: string; rules_diff: string | null; soul_diff: string | null };
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    result = JSON.parse(match[0]);
  } catch (err) {
    console.error("[meta-agent] Failed to parse response:", err);
    return;
  }

  if (!result.rules_diff && !result.soul_diff) {
    console.log("[meta-agent] No changes proposed.");
    console.log("Reasoning:", result.reasoning);
    return;
  }

  const git = simpleGit(AGENT_REPO_PATH);
  const timestamp = Date.now();
  const branch = `meta-agent/update-${timestamp}`;

  await git.checkout(["-b", branch]);

  if (result.rules_diff) {
    const existing = await readAgentFile("RULES.md");
    await writeFile(
      join(AGENT_REPO_PATH, "RULES.md"),
      existing + `\n\n<!-- meta-agent proposed diff ${new Date().toISOString()} -->\n${result.rules_diff}\n`,
      "utf-8"
    );
    await git.add("RULES.md");
  }

  if (result.soul_diff) {
    const existing = await readAgentFile("SOUL.md");
    await writeFile(
      join(AGENT_REPO_PATH, "SOUL.md"),
      existing + `\n\n<!-- meta-agent proposed diff ${new Date().toISOString()} -->\n${result.soul_diff}\n`,
      "utf-8"
    );
    await git.add("SOUL.md");
  }

  await git.commit(`meta-agent: propose rule updates (${new Date().toISOString()})`);

  try {
    await git.push("origin", branch);
    console.log(`[meta-agent] Branch pushed: ${branch}`);
  } catch {
    console.log(`[meta-agent] Branch committed locally: ${branch} (push failed — open PR manually)`);
  }

  console.log("[meta-agent] Reasoning:", result.reasoning);
}

main().catch((err) => {
  console.error("[meta-agent] Fatal:", err);
  process.exit(1);
});
