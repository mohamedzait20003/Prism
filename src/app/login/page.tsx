"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-500/25">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Welcome to PRism</h1>
          <p className="text-sm text-gray-500">
            AI-powered code review that learns from you
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-gray-100">Sign in to continue</h2>
            <p className="text-xs text-gray-500">
              Connect with GitHub to access your dashboard
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {loading ? "Redirecting…" : "Continue with GitHub"}
          </button>

          <p className="text-center text-xs text-gray-600">
            By signing in you agree to connect your GitHub account.
            PRism only reads pull request diffs and posts review comments.
          </p>
        </div>

        <p className="text-center text-xs text-gray-700">
          &copy; {new Date().getFullYear()} PRism
        </p>
      </div>
    </div>
  );
}
