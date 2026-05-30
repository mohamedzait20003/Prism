import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Nav } from "./nav";

export const metadata: Metadata = {
  title: "PRism",
  description: "AI-powered code review agent",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <SessionProvider>
          <Nav />
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

export default RootLayout;
