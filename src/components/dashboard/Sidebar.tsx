"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, CalendarDays, PhoneCall, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/dashboard/calls",        label: "Calls",        icon: PhoneCall },
  { href: "/dashboard/settings",     label: "Settings",     icon: Settings },
];

type Props = { businessName: string };

export default function Sidebar({ businessName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#09090f] px-4 py-6">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-violet-500 opacity-40 blur-[6px]" />
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
            <Zap className="h-3.5 w-3.5 text-white" fill="currentColor" />
          </div>
        </div>
        <span className="font-bold tracking-tight text-white">ReserveAI</span>
      </div>

      {/* Business name pill */}
      <div className="mb-4 px-2">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-white/25">
          {businessName}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "text-white"
                  : "text-white/40 hover:text-white/75"
              )}
            >
              {/* Active background */}
              {active && (
                <span className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/[0.08]" />
              )}
              {/* Hover background */}
              {!active && (
                <span className="absolute inset-0 rounded-xl opacity-0 bg-white/[0.04] transition-opacity group-hover:opacity-100" />
              )}

              {/* Icon with active glow */}
              <span className="relative">
                {active && (
                  <span className="absolute inset-0 rounded blur-[6px] bg-violet-400/60" />
                )}
                <Icon
                  className={cn(
                    "relative h-4 w-4 shrink-0 transition-colors",
                    active ? "text-violet-400" : "text-white/30 group-hover:text-white/60"
                  )}
                />
              </span>

              <span className="relative">{label}</span>

              {/* Active indicator bar */}
              {active && (
                <span className="absolute right-2 h-4 w-0.5 rounded-full bg-violet-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] px-2 pt-4">
        <UserButton
          appearance={{
            variables: { colorPrimary: "#8b5cf6" },
          }}
        />
        <span className="text-sm text-white/35 truncate">Account</span>
      </div>
    </aside>
  );
}
