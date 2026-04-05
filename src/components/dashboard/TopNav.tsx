"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",              label: "Overview"     },
  { href: "/dashboard/reservations", label: "Reservations" },
  { href: "/dashboard/calls",        label: "Calls"        },
  { href: "/dashboard/settings",     label: "Settings"     },
];

type Props = { businessName: string };

export default function TopNav({ businessName }: Props) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center justify-between border-b px-6"
      style={{
        backgroundColor: "oklch(0.10 0.007 72)",
        borderColor: "oklch(0.22 0.008 72 / 0.5)",
      }}
    >
      {/* Left: logo + nav */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-lg leading-none"
            style={{ fontFamily: "var(--font-instrument-serif)", color: "#e0d8cc" }}
          >
            Reserve
          </span>
          <span
            className="rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >
            AI
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 py-1.5 text-sm transition-colors rounded-lg",
                  active
                    ? "text-[#e0d8cc]"
                    : "text-[#5a5348] hover:text-[#a09585]"
                )}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                    style={{ background: "#c97d14" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: live badge + user */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full" style={{ background: "#4a9e6b" }} />
          <span className="text-xs" style={{ color: "#4a9e6b" }}>AI Live</span>
        </div>
        <span className="text-xs truncate max-w-[120px]" style={{ color: "#3a3530" }}>
          {businessName}
        </span>
        <UserButton
          appearance={{ variables: { colorPrimary: "#c97d14" } }}
        />
      </div>
    </header>
  );
}
