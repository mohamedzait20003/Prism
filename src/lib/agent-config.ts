import { db } from "./db";

export interface AgentConfigData {
  soul: string;
  rules: string;
}

const WORKER_TTL = 5 * 60 * 1000;

let _cachedAt = 0;
let _cache: AgentConfigData | null = null;


export async function getAgentConfigCached(): Promise<AgentConfigData> {
  const now = Date.now();
  if (_cache && now - _cachedAt < WORKER_TTL) 
    return _cache;

  const [soulRow, rulesRow] = await Promise.all([
    db.agentConfig.findUnique({ where: { key: "soul" } }),
    db.agentConfig.findUnique({ where: { key: "rules" } }),
  ]);

  _cache = {
    soul: soulRow?.content ?? "",
    rules: rulesRow?.content ?? "",
  };

  _cachedAt = now;
  return _cache;
}

export function invalidateWorkerCache() {
  _cache = null;
  _cachedAt = 0;
}

export async function getAgentConfigFromDB(): Promise<AgentConfigData> {
  const [soulRow, rulesRow] = await Promise.all([
    db.agentConfig.findUnique({ where: { key: "soul" } }),
    db.agentConfig.findUnique({ where: { key: "rules" } }),
  ]);
  return {
    soul: soulRow?.content ?? "",
    rules: rulesRow?.content ?? "",
  };
}
