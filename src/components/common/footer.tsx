import Link from "next/link";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/Logo.svg" alt="PRism" width={80} height={33} priority />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground">AI-powered code review</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PRism - All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
