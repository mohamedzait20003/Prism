import Link from "next/link";
import type { Stats, ReviewSummary } from "@/models";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function DashboardPage() {
  const [stats, reviews]: [Stats, ReviewSummary[]] = await Promise.all([
    fetch(`${BASE}/api/stats`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${BASE}/api/reviews`, { cache: "no-store" }).then((r) => r.json()),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-2xl font-semibold text-gray-100">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Reviews", value: stats.totalReviews },
          { label: "Comments", value: stats.totalComments },
          { label: "Approval rate", value: stats.approvalRate != null ? `${stats.approvalRate}%` : "—" },
          { label: "Feedback entries", value: stats.feedbackCount },
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
        {reviews.length === 0 ? (
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
                {reviews.map((r) => (
                  <tr key={r.id} className="bg-gray-950 hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{r.repo}</td>
                    <td className="px-4 py-3 text-gray-300">#{r.prNum}</td>
                    <td className="px-4 py-3 text-gray-400">{r.commentCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
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
        {stats.topRules.length === 0 ? (
          <p className="text-gray-600 text-sm">No feedback yet.</p>
        ) : (
          <ol className="space-y-2">
            {stats.topRules.map((r, i) => (
              <li key={r.ruleId} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
                <span className="text-gray-600 w-5 text-right text-sm">{i + 1}.</span>
                <span className="font-mono text-sm text-indigo-400 flex-1">{r.ruleId ?? "unknown"}</span>
                <span className="text-gray-400 text-sm">{r.count} rejection{r.count !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
