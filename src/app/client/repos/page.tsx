"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface ConnectedRepo {
  id: string;
  fullName: string;
  active: boolean;
  createdAt: string;
}

interface GithubRepo {
  fullName: string;
  private: boolean;
  canAdmin: boolean;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => (r.ok ? r.json() : []));

const CONNECTED_KEY = ["repos", "connected"];
const GITHUB_KEY    = ["repos", "github"];

const ClientReposPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const { data: connected = [] } = useQuery<ConnectedRepo[]>({
    queryKey: CONNECTED_KEY,
    queryFn: () => fetcher("/api/client/repos"),
    refetchInterval: 30_000,
  });

  const { data: allRepos = [], isLoading: reposLoading } = useQuery<GithubRepo[]>({
    queryKey: GITHUB_KEY,
    queryFn: () => fetcher("/api/client/repos/github"),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const connectedNames = new Set(connected.map((r) => r.fullName));
  const filtered = allRepos.filter(
    (r) => r.canAdmin &&
           !connectedNames.has(r.fullName) &&
           r.fullName.toLowerCase().includes(search.toLowerCase())
  );

  async function connect(fullName: string) {
    setConnecting(fullName);
    setConnectError(null);
    const res = await fetch("/api/client/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setConnectError(data.error ?? "Failed to connect repository.");
    }
    setConnecting(null);
    qc.invalidateQueries({ queryKey: CONNECTED_KEY });
  }

  async function disconnect(id: string) {
    setDisconnecting(id);
    await fetch(`/api/client/repos/${id}`, { method: "DELETE" });
    setDisconnecting(null);
    qc.invalidateQueries({ queryKey: CONNECTED_KEY });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Repositories</h1>
            <p className="text-muted-foreground mt-2">
              {connected.length === 0
                ? "Connect a repository to start automated pull request reviews."
                : `${connected.length} repositor${connected.length === 1 ? "y" : "ies"} monitored · ${filtered.length} available to connect`}
            </p>
          </div>
        </div>

        {connectError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <span>⚠</span> {connectError}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* Left — connected repos */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Connected</CardTitle>
                    <CardDescription className="mt-0.5">Actively monitored</CardDescription>
                  </div>
                  <Badge variant={connected.length > 0 ? "default" : "secondary"}>
                    {connected.length}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {connected.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                      🔗
                    </div>
                    <div>
                      <p className="text-sm font-medium">None yet</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select a repository on the right to connect it.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Repository</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connected.map((r) => {
                        const ghRepo = allRepos.find((g) => g.fullName === r.fullName);
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div>
                                <p className="font-mono text-xs font-semibold truncate max-w-40">
                                  {r.fullName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="text-xs text-muted-foreground">
                                    {ghRepo?.private ? "Private" : "Public"} · {new Date(r.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => disconnect(r.id)}
                                disabled={disconnecting === r.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                              >
                                {disconnecting === r.id ? "…" : "Disconnect"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — available repos */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Available</CardTitle>
                    <CardDescription className="mt-0.5">
                      {reposLoading && allRepos.length === 0
                        ? "Loading your repositories…"
                        : `${filtered.length} repositor${filtered.length === 1 ? "y" : "ies"} you can connect`}
                    </CardDescription>
                  </div>
                  <Input
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-44 h-8 text-sm"
                  />
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {/* Scrollable container */}
                <div className="overflow-y-auto max-h-105 divide-y divide-border">
                  {reposLoading && allRepos.length === 0 ? (
                    <div className="space-y-0 divide-y divide-border">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                          <div className="h-4 w-4 rounded bg-muted/60 animate-pulse shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-40 rounded bg-muted/60 animate-pulse" />
                            <div className="h-2.5 w-20 rounded bg-muted/40 animate-pulse" />
                          </div>
                          <div className="h-7 w-16 rounded-md bg-muted/40 animate-pulse shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-14 text-center text-sm text-muted-foreground">
                      {search
                        ? `No repositories matching "${search}"`
                        : "All your admin-accessible repositories are connected."}
                    </div>
                  ) : (
                    filtered.map((r) => {
                      const [owner, name] = r.fullName.split("/");
                      return (
                        <div
                          key={r.fullName}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors group"
                        >
                          <span className="text-muted-foreground shrink-0 text-base">
                            {r.private ? "🔒" : "📂"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono font-semibold truncate">
                              <span className="text-muted-foreground font-normal">{owner}/</span>
                              {name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.private ? "Private" : "Public"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => connect(r.fullName)}
                            disabled={connecting === r.fullName}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                          >
                            {connecting === r.fullName ? "Connecting…" : "Connect"}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
                <Separator />
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => qc.invalidateQueries({ queryKey: GITHUB_KEY })}
                  >
                    Refresh now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientReposPage;
