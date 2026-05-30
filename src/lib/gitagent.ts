import { resolve } from "path";
import type { Finding } from "./github";

const MODEL = "anthropic:claude-sonnet-4-6";

async function runQuery(dir: string, prompt: string): Promise<string> {
  const { query } = await import("@open-gitagent/gitagent");
  const stream = query({ prompt, dir, model: MODEL });
  let output = "";

  for await (const msg of stream) {
    if (msg.type === "delta" && msg.deltaType === "text") {
      output += msg.content;
    } else if (msg.type === "system" && msg.subtype === "error") {
      throw new Error(`Agent error: ${msg.content}`);
    }
  }

  return output;
}

export async function runReview(agentRepo: string, diff: string): Promise<Finding[]> {
  const dir = resolve(agentRepo);
  const prompt = `You are a code reviewer. Analyse the diff below and return a JSON array of findings only — no prose, no markdown fences, just the raw JSON array. Each finding: { "file": string, "line": number, "message": string, "severity": "error"|"warning"|"info", "ruleId": string }
    Return [] if there are no issues.

    Diff:${diff}
  `;

  try {
    const raw = await runQuery(dir, prompt);
    const match = raw.match(/\[[\s\S]*\]/);

    if (!match) 
      return [];
    
    return JSON.parse(match[0]) as Finding[];
  } catch {
    return [];
  }
}

export async function runMetaAgentQuery(metaAgentDir: string, prompt: string): Promise<string> {
  const dir = resolve(metaAgentDir);
  return runQuery(dir, prompt);
}
