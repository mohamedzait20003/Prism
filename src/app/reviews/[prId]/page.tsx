import { notFound } from "next/navigation";
import { CommentCard } from "./comment-card";
import type { ReviewDetail } from "@/models";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const severityBadge: Record<string, string> = {
  error: "bg-red-900 text-red-300 border-red-800",
  warning: "bg-yellow-900 text-yellow-300 border-yellow-800",
  info: "bg-blue-900 text-blue-300 border-blue-800",
};

const ReviewPage = async ({ params }: { params: Promise<{ prId: string }> }) => {
  const { prId } = await params;
  const res = await fetch(`${BASE}/api/reviews/${prId}`, { cache: "no-store" });
  
  if (!res.ok) 
    notFound();

  const review: ReviewDetail = await res.json();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">
          PR <span className="text-indigo-400">#{review.prNum}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {review.repo} · {review.sha.slice(0, 7)} · agent v{review.agentVer} · {new Date(review.createdAt).toLocaleString()}
        </p>
      </div>

      {review.comments.length === 0 ? (
        <p className="text-gray-600 text-sm">No findings for this PR.</p>
      ) : (
        <div className="space-y-4">
          {review.comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              severityClass={severityBadge[c.severity] ?? severityBadge.info}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewPage;
