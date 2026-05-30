"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-3 flex items-center gap-6">
      <Link href="/" className="font-bold text-indigo-400 tracking-tight text-lg mr-2">
        PRism
      </Link>

      {session && (
        <>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
            Dashboard
          </Link>
          <Link href="/agents/reviewer" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
            Agent
          </Link>
        </>
      )}

      <div className="ml-auto flex items-center gap-4">
        {session ? (
          <>
            <div className="flex items-center gap-2.5">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={28}
                  height={28}
                  className="rounded-full ring-1 ring-gray-700"
                />
              )}
              <span className="text-sm text-gray-400 hidden sm:block">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors border border-gray-800 rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}