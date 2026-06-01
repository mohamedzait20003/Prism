import Link from "next/link";

import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            AI-powered · Self-improving · GitHub native
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Code review that{" "}
            <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              learns from you
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            PRism reviews every pull request automatically, posts inline comments, and refines its own rules based on your feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg">
              <Link href="/auth/register">Get started free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-semibold mb-12">
          Everything you need for intelligent code review
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "⚡", title: "Instant reviews",     desc: "Every PR reviewed automatically the moment it opens." },
            { icon: "🔒", title: "Security first",       desc: "Scans for OWASP Top 10 vulnerabilities on every diff." },
            { icon: "🧠", title: "Learns from feedback", desc: "Reject a comment and the agent learns not to flag it again." },
            { icon: "🔄", title: "Self-improving",       desc: "The meta-agent refines its rules based on your rejections." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 space-y-3 hover:border-primary/40 transition-colors">
              <span className="text-2xl">{icon}</span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-semibold mb-12">How it works</h2>
          <ol className="space-y-8">
            {[
              { step: "01", title: "Connect your repo",      desc: "Register PRism as a webhook on any GitHub repository you admin." },
              { step: "02", title: "Open a pull request",    desc: "PRism fetches the diff and runs code-smell and security checks in parallel." },
              { step: "03", title: "Review inline comments", desc: "Findings posted directly on the PR. Approve what's correct, reject what isn't." },
              { step: "04", title: "PRism gets smarter",     desc: "Rejections train the meta-agent, which proposes better rules on a new branch." },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-6 items-start">
                <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
