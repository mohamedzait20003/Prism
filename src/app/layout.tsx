import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "./nav";

export const metadata: Metadata = {
  title: "PRism",
  description: "AI-powered code review agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
