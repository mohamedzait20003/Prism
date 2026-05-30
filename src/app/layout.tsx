import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRism",
  description: "AI-powered code review agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 px-6 py-3 flex gap-6 items-center">
          <span className="font-semibold text-indigo-400 tracking-tight">PRism</span>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Dashboard</a>
          <a href="/agents/reviewer" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Agent</a>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
