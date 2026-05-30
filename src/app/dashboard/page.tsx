import Link from "next/link";
import type { Stats, ReviewSummary } from "@/models";
import ProgressBar from "./progress-bar";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const metrics = (stats: Stats) => [
  { label: "Total Reviews",    value: stats.totalReviews,                                    icon: "📋", grad: "from-indigo-500/10 to-indigo-500/5 border-indigo-800/50",  text: "text-indigo-400"  },
  { label: "Comments Posted",  value: stats.totalComments,                                   icon: "💬", grad: "from-violet-500/10 to-violet-500/5 border-violet-800/50",  text: "text-violet-400"  },
  { label: "Approval Rate",    value: stats.approvalRate != null ? `${stats.approvalRate}%` : "—", icon: "✅", grad: "from-emerald-500/10 to-emerald-500/5 border-emerald-800/50", text: "text-emerald-400" },
  { label: "Feedback Entries", value: stats.feedbackCount,                                   icon: "🧠", grad: "from-amber-500/10 to-amber-500/5 border-amber-800/50",    text: "text-amber-400"   },
];

const DashboardPage = async () => {
  const [stats, reviews]: [Stats, ReviewSummary[]] = await Promise.all([
    fetch(`${BASE}/api/stats`,   { cache: "no-store" }).then((r) => r.json()),
    fetch(`${BASE}/api/reviews`, { cache: "no-store" }).then((r) => r.json()),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all automated code reviews</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics(stats).map(({ label, value, icon, grad, text }) => (
            <div key={label} className={`rounded-xl border bg-linear-to-b ${grad} p-5 space-y-3`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <span className="text-lg">{icon}</span>
              </div>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-200">Recent Reviews</h2>
              <span className="text-xs text-gray-600">{reviews.length} shown</span>
            </div>
            {reviews.length === 0 ? (
              <div className="px-6 py-12 text-center space-y-1">
                <p className="text-gray-600 text-sm">No reviews yet.</p>
                <p className="text-gray-700 text-xs">Connect a GitHub webhook to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {reviews.map((r) => (
                  <div key={r.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 rounded px-2 py-0.5">
                          #{r.prNum}
                        </span>
                        <span className="text-sm text-gray-300 truncate">{r.repo}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {r.commentCount} comment{r.commentCount !== 1 ? "s" : ""} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/reviews/${r.id}`}
                      className="shrink-0 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-indigo-700 hover:text-indigo-400 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-gray-200">Top Rejected Rules</h2>
              <p className="text-xs text-gray-600 mt-0.5">Highest false-positive rules</p>
            </div>
            {stats.topRules.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600 text-sm">No feedback yet.</p>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-4">
                {stats.topRules.map(({ ruleId, count }, i) => {
                  const pct = Math.round((count / stats.topRules[0].count) * 100);
                  return (
                    <div key={ruleId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-4">{i + 1}.</span>
                          <span className="text-xs font-mono text-gray-300">{ruleId ?? "unknown"}</span>
                        </span>
                        <span className="text-xs text-gray-500">{count}×</span>
                      </div>
                      <ProgressBar pct={pct} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-200">Trigger a manual review</h3>
            <p className="text-xs text-gray-500 mt-0.5">Run the agent on any open PR without a webhook event.</p>
          </div>
          <Link
            href="/agents/reviewer"
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Open Agent Editor
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;