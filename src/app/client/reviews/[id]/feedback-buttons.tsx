"use client";

import { useState } from "react";

interface Props {
  commentId: string;
  onDone: (approved: boolean) => void;
}

export function FeedbackButtons({ commentId, onDone }: Props) {
  const [rejecting, setRejecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(approved: boolean) {
    setLoading(true);
    await fetch("/api/client/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, approved, humanEdit: approved ? undefined : correction }),
    });
    setLoading(false);
    onDone(approved);
  }

  if (rejecting) {
    return (
      <div className="mt-2 flex flex-col gap-2">
        <input
          type="text"
          placeholder="What should it have said? (leave blank to dismiss)"
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          <button onClick={() => submit(false)} disabled={loading}
            className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">
            Confirm reject
          </button>
          <button onClick={() => setRejecting(false)}
            className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:text-gray-200">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      <button onClick={() => submit(true)} disabled={loading}
        className="rounded bg-green-800 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
        ✓ Approve
      </button>
      <button onClick={() => setRejecting(true)} disabled={loading}
        className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
        ✗ Reject
      </button>
    </div>
  );
}
