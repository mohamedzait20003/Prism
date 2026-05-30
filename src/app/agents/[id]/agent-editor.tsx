"use client";

import { useState } from "react";

interface Props {
  id: string;
  initialSoul: string;
  initialRules: string;
}

export function AgentEditor({ id, initialSoul, initialRules }: Props) {
  const [soul, setSoul] = useState(initialSoul);
  const [rules, setRules] = useState(initialRules);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    const res = await fetch(`/api/agents/${id}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soul, rules }),
    });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="soul-editor" className="text-xs font-medium text-gray-400 uppercase tracking-wide">SOUL.md</label>
        <textarea
          id="soul-editor"
          value={soul}
          onChange={(e) => setSoul(e.target.value)}
          rows={14}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rules-editor" className="text-xs font-medium text-gray-400 uppercase tracking-wide">RULES.md</label>
        <textarea
          id="rules-editor"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={22}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && <span className="text-sm text-green-400">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-400">Save failed.</span>}
      </div>
    </div>
  );
}
