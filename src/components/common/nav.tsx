"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clientLinks = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/repos",     label: "Repos"     },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users",     label: "Users"     },
  { href: "/admin/agents",    label: "Agents"    },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md"
    >
      {/* Animated background pill */}
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-primary/10"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className={`relative z-10 transition-colors duration-200 ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;
  const links = role === "ADMIN" ? adminLinks : role === "CLIENT" ? clientLinks : [];
  const initials = session?.user?.name?.slice(0, 2).toUpperCase() ?? "?";
  const homeHref =
    role === "ADMIN" ? "/admin/dashboard" : role === "CLIENT" ? "/client/dashboard" : "/";

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">

        {/* Logo */}
        <Link href={homeHref} className="flex items-center shrink-0 group">
          <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Image src="/Logo.svg" alt="PRism" width={80} height={33} priority />
          </motion.div>
        </Link>

        {/* Admin badge */}
        <AnimatePresence>
          {role === "ADMIN" && (
            <motion.div
              key="admin-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                Admin
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav links with sliding pill */}
        <AnimatePresence>
          {links.length > 0 && (
            <motion.nav
              key={role}
              className="flex items-center gap-0.5 ml-2"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.08 }}
            >
              {links.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                >
                  <NavLink
                    href={href}
                    label={label}
                    active={pathname === href || pathname.startsWith(href + "/")}
                  />
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <AnimatePresence mode="wait">
            {session ? (
              <motion.div
                key="user-menu"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <Avatar className="h-8 w-8">
                        {session.user?.image && (
                          <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
                        )}
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium text-foreground">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                key="auth-buttons"
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Get started</Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
