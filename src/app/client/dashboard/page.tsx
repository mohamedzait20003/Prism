import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "./progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Stats, ReviewSummary } from "@/models";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface ConnectedRepo {
  id: string;
  fullName: string;
  active: boolean;
  createdAt: string;
}

function severityColor(rate: number | null) {
  if (rate === null) return "text-muted-foreground";
  if (rate >= 80) return "text-emerald-400";
  if (rate >= 50) return "text-amber-400";
  return "text-destructive";
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const h = { Cookie: cookieStore.toString() };

  const [stats, reviews, repos]: [Stats, ReviewSummary[], ConnectedRepo[]] =
    await Promise.all([
      fetch(`${BASE}/api/client/stats`, { cache: "no-store", headers: h }).then((r) => r.json()),
      fetch(`${BASE}/api/client/reviews`, { cache: "no-store", headers: h }).then((r) => r.json()),
      fetch(`${BASE}/api/client/repos`, { cache: "no-store", headers: h }).then((r) => r.ok ? r.json() : []),
    ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const noActivity = stats.totalReviews === 0;

  const metrics = [
    {
      label: "Reviews",
      value: stats.totalReviews,
      sub: "PRs analysed",
      color: "text-primary",
      border: "border-l-primary",
    },
    {
      label: "Findings",
      value: stats.totalComments,
      sub: "comments posted",
      color: "text-violet-400",
      border: "border-l-violet-400",
    },
    {
      label: "Approval rate",
      value: stats.approvalRate != null ? `${stats.approvalRate}%` : "—",
      sub: stats.approvalRate != null
        ? stats.approvalRate >= 80 ? "great accuracy" : "room to improve"
        : "no feedback yet",
      color: severityColor(stats.approvalRate),
      border: `border-l-[${stats.approvalRate != null && stats.approvalRate >= 80 ? "#34d399" : "#fbbf24"}]`,
    },
    {
      label: "Feedback",
      value: stats.feedbackCount,
      sub: "comments rejected",
      color: "text-amber-400",
      border: "border-l-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* ── Page header ── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground mt-2">
              {repos.length === 0
                ? "Connect your first repository to begin automated code reviews."
                : `Monitoring ${repos.length} repositor${repos.length === 1 ? "y" : "ies"} · ${noActivity ? "No reviews yet" : `${stats.totalReviews} review${stats.totalReviews !== 1 ? "s" : ""} total`}`}
            </p>
          </div>
          <Button asChild variant={repos.length === 0 ? "default" : "outline"} className="shrink-0">
            <Link href="/client/repos">
              {repos.length === 0 ? "Connect a repo" : "Manage repos"}
            </Link>
          </Button>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(({ label, value, sub, color, border }) => (
            <Card key={label} className={`border-l-4 ${border}`}>
              <CardContent className="px-5 py-5 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {label}
                </p>
                <p className={`text-4xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── No repos onboarding ── */}
        {repos.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-20 flex flex-col items-center gap-5 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                🔗
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="font-semibold text-lg">No repositories connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect a GitHub repository and PRism will automatically review every pull
                  request — posting inline comments with findings.
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild size="lg">
                  <Link href="/client/repos">Connect your first repository</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-4 text-center text-xs text-muted-foreground max-w-sm">
                {["Connect repo", "Open a PR", "Get findings"].map((step, i) => (
                  <div key={step} className="space-y-1">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold mx-auto">
                      {i + 1}
                    </div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent reviews */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Reviews</CardTitle>
                      <CardDescription className="mt-0.5">
                        Latest pull requests analysed by PRism
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{reviews.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {reviews.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-center">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                        🔍
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">No reviews yet</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Open a pull request on a connected repository and PRism will
                          automatically review it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border -mx-2">
                      {reviews.map((r, i) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-4 px-2 py-3.5 hover:bg-muted/40 rounded-lg transition-colors"
                        >
                          {/* Index */}
                          <span className="text-xs text-muted-foreground w-5 text-right shrink-0 tabular-nums">
                            {i + 1}
                          </span>

                          {/* PR badge */}
                          <Badge variant="outline" className="font-mono shrink-0 text-xs">
                            #{r.prNum}
                          </Badge>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.repo}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {r.commentCount === 0
                                  ? "No findings"
                                  : `${r.commentCount} finding${r.commentCount !== 1 ? "s" : ""}`}
                              </span>
                              <span className="text-muted-foreground text-xs">·</span>
                              <span className="text-xs text-muted-foreground">
                                {relativeDate(r.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Findings indicator */}
                          <div className="shrink-0">
                            {r.commentCount === 0 ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs hover:bg-emerald-500/10">
                                Clean
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {r.commentCount} issues
                              </Badge>
                            )}
                          </div>

                          <Button variant="ghost" size="sm" asChild className="shrink-0 text-xs">
                            <Link href={`/client/reviews/${r.id}`}>View →</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top false positives */}
              {stats.topRules.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Top False Positives</CardTitle>
                    <CardDescription>
                      Rules you reject most — the agent learns from these
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-4">
                    {stats.topRules.map(({ ruleId, count }, i) => {
                      const pct = Math.round((count / stats.topRules[0].count) * 100);
                      return (
                        <div key={ruleId} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2.5">
                              <span className="text-xs text-muted-foreground w-4 tabular-nums">
                                {i + 1}.
                              </span>
                              <code className="text-xs font-mono">{ruleId ?? "unknown"}</code>
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {count} rejection{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ProgressBar pct={pct} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">

              {/* Connected repos */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Repositories</CardTitle>
                      <CardDescription className="mt-0.5">Actively monitored</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/client/repos">Manage</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-1 space-y-2">
                  {repos.map((r) => {
                    const repoReviews = reviews.filter((rev) => rev.repo === r.fullName);
                    return (
                      <div
                        key={r.id}
                        className="rounded-lg border border-border bg-muted/20 px-3.5 py-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-semibold truncate">
                              {r.fullName.split("/")[1]}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {r.fullName.split("/")[0]}
                            </p>
                          </div>
                          <Badge
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs hover:bg-emerald-500/10 shrink-0"
                          >
                            Active
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {repoReviews.length} review{repoReviews.length !== 1 ? "s" : ""}
                          </span>
                          <span>Since {new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Stats breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Your activity at a glance</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {[
                    { label: "PRs reviewed",   value: stats.totalReviews },
                    { label: "Total findings", value: stats.totalComments },
                    {
                      label: "Approval rate",
                      value: stats.approvalRate != null ? `${stats.approvalRate}%` : "—",
                      colored: true,
                      rate: stats.approvalRate,
                    },
                    { label: "Feedback given", value: stats.feedbackCount },
                    {
                      label: "Avg per review",
                      value: stats.totalReviews > 0
                        ? (stats.totalComments / stats.totalReviews).toFixed(1)
                        : "—",
                    },
                  ].map(({ label, value, colored, rate }, i, arr) => (
                    <div key={label}>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span
                          className={`text-sm font-semibold tabular-nums ${colored ? severityColor(rate ?? null) : "text-foreground"}`}
                        >
                          {value}
                        </span>
                      </div>
                      {i < arr.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
