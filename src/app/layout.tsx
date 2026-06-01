import "./globals.css";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { Providers } from "./providers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LayoutShell } from "@/components/common/layout-shell";

export const metadata: Metadata = {
  title: "PRism",
  description: "AI-powered code review agent",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers session={session}>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
