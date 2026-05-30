"use client";

import { useState } from "react";
import { FeedbackButtons } from "./feedback-buttons";
import type { Comment } from "@/models";

export function CommentCard({
  comment,
  severityClass,
}: {
  comment: Comment;
  severityClass: string;
}) {
  const [outcome, setOutcome] = useState<"approved" | "rejected" | null>(
    comment.approved === true ? "approved" : comment.approved === false ? "rejected" : null
  );

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${severityClass}`}>
          {comment.severity}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-mono truncate">
            {comment.file}:{comment.line}
          </p>
          <p className="text-sm text-gray-200 mt-0.5">{comment.message}</p>
          {comment.ruleId && (
            <p className="text-xs text-gray-600 mt-1 font-mono">{comment.ruleId}</p>
          )}
        </div>
      </div>

      {outcome === null ? (
        <FeedbackButtons
          commentId={comment.id}
          onDone={() => setOutcome("approved")}
        />
      ) : outcome === "approved" ? (
        <p className="text-xs text-green-500">✓ Approved</p>
      ) : (
        <p className="text-xs text-red-400">✗ Rejected{comment.humanEdit ? ` — "${comment.humanEdit}"` : ""}</p>
      )}
    </div>
  );
}
