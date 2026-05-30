import { readFile } from "fs/promises";
import { resolve, join } from "path";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getFeedbackCount(): Promise<number> {
  try {
    const agentRoot = resolve(process.env.AGENT_REPO_PATH ?? "./agent");
    const content = await readFile(join(agentRoot, "memory", "feedback.md"), "utf-8");
    return (content.match(/^## PR #/gm) ?? []).length;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const [
    totalReviews,
    totalComments,
    approvedComments,
    feedbackedComments,
    recentReviews,
    topRules,
    feedbackCount,
  ] = await Promise.all([
    db.review.count(),
    db.comment.count(),
    db.comment.count({ where: { approved: true } }),
    db.comment.count({ where: { approved: { not: null } } }),
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { comments: true } } },
    }),
    db.feedbackEntry.groupBy({
      by: ["ruleId"],
      _count: { ruleId: true },
      orderBy: { _count: { ruleId: "desc" } },
      take: 5,
    }),
    getFeedbackCount(),
  ]);

  const approvalRate =
    feedbackedComments > 0
      ? Math.round((approvedComments / feedbackedComments) * 100)
      : null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-2xl font-semibold text-gray-100">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Reviews", value: totalReviews },
          { label: "Comments", value: totalComments },
          { label: "Approval rate", value: approvalRate != null ? `${approvalRate}%` : "—" },
          { label: "Feedback entries", value: feedbackCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent reviews */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-400 uppercase tracking-wide">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <p className="text-gray-600 text-sm">No reviews yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900 text-gray-500 text-xs uppercase">
                <tr>
                  {["Repo", "PR", "Comments", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentReviews.map((r) => (
                  <tr key={r.id} className="bg-gray-950 hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{r.repo}</td>
                    <td className="px-4 py-3 text-gray-300">#{r.prNum}</td>
                    <td className="px-4 py-3 text-gray-400">{r._count.comments}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.createdAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/reviews/${r.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top rejected rules */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-400 uppercase tracking-wide">Top Rejected Rules</h2>
        {topRules.length === 0 ? (
          <p className="text-gray-600 text-sm">No feedback yet.</p>
        ) : (
          <ol className="space-y-2">
            {topRules.map((r, i) => (
              <li key={r.ruleId} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
                <span className="text-gray-600 w-5 text-right text-sm">{i + 1}.</span>
                <span className="font-mono text-sm text-indigo-400 flex-1">{r.ruleId ?? "unknown"}</span>
                <span className="text-gray-400 text-sm">{r._count.ruleId} rejection{r._count.ruleId !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
