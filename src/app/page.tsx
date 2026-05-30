import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <section className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-800 bg-indigo-950/50 px-4 py-1.5 text-xs font-medium text-indigo-300">
            AI-powered · Self-improving · GitHub native
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Code review that{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              learns from you
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            PRism reviews every pull request automatically, posts inline comments, and refines its own rules based on your feedback — getting sharper with every review.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Get started free
            </Link>
            <a
              href="https://github.com/mohamedzait20003/Prism"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-semibold text-gray-200 mb-12">
          Everything you need for intelligent code review
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "⚡",
              title: "Instant reviews",
              desc: "Every PR is reviewed automatically the moment it opens or updates. No waiting, no manual triggers.",
            },
            {
              icon: "🔒",
              title: "Security first",
              desc: "Scans for OWASP Top 10 vulnerabilities and dangerous code patterns on every diff.",
            },
            {
              icon: "🧠",
              title: "Learns from feedback",
              desc: "Approve or reject each comment. Rejections feed the meta-agent which proposes better rules.",
            },
            {
              icon: "🔄",
              title: "Self-improving",
              desc: "The meta-agent analyses rejection patterns and opens PRs with refined rules — you stay in control.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 space-y-3 hover:border-indigo-800 transition-colors"
            >
              <span className="text-2xl">{icon}</span>
              <h3 className="font-semibold text-gray-100">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 bg-gray-900/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-semibold text-gray-200 mb-12">
            How it works
          </h2>
          <ol className="space-y-8">
            {[
              { step: "01", title: "Connect your repo", desc: "Register PRism as a GitHub webhook on your repository. One URL, one secret." },
              { step: "02", title: "Open a pull request", desc: "GitHub notifies PRism. The AI agent fetches the diff, runs code-smell and security checks in parallel." },
              { step: "03", title: "Review inline comments", desc: "Findings are posted directly on the PR. Approve what's correct, reject what isn't." },
              { step: "04", title: "PRism gets smarter", desc: "Rejections train the meta-agent. It proposes rule updates on a new branch for you to merge." },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-6 items-start">
                <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-800 bg-indigo-950 text-xs font-bold text-indigo-400">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-100">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-gray-100">
            Ready to ship better code?
          </h2>
          <p className="text-gray-500">
            Sign in with GitHub and connect your first repository in minutes.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-xs text-gray-600">
        PRism — AI code review agent · Built with Next.js, GitAgent &amp; Anthropic Claude
      </footer>
    </div>
  );
}

export default LandingPage;
