"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarX2, Loader2, ExternalLink } from "lucide-react";

type Props = {
  connected: boolean;
  /** Pass ?google= param from URL so we can show feedback after redirect */
  googleParam?: string | null;
};

export default function GoogleCalendarCard({ connected, googleParam }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "denied">("idle");

  // Show feedback from OAuth redirect query param
  useEffect(() => {
    if (googleParam === "connected") setStatus("success");
    else if (googleParam === "denied")  setStatus("denied");
    else if (googleParam === "error")   setStatus("error");
  }, [googleParam]);

  async function handleConnect() {
    setLoading(true);
    try {
      const res  = await fetch("/api/google/connect");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("No URL returned");
    } catch {
      setStatus("error");
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch("/api/google/disconnect", { method: "POST" });
      router.refresh(); // re-run server component to reflect new state
    } catch {
      setStatus("error");
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{
          background: connected
            ? "radial-gradient(circle, #34d399, transparent 70%)"
            : "radial-gradient(circle, #8b5cf6, transparent 70%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* Icon + info */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              connected
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-white/[0.08] bg-white/[0.04]"
            }`}
          >
            {connected ? (
              <CalendarCheck className="h-5 w-5 text-emerald-400" />
            ) : (
              <CalendarX2 className="h-5 w-5 text-white/30" />
            )}
          </div>

          <div>
            <p className="font-medium text-white">Google Calendar</p>
            <p className="mt-0.5 text-xs text-white/35">
              {connected
                ? "Connected — AI won't double-book existing events"
                : "Not connected — connect to block busy slots automatically"}
            </p>

            {/* Inline feedback */}
            {status === "success" && (
              <p className="mt-1.5 text-xs font-medium text-emerald-400">
                ✓ Calendar connected successfully
              </p>
            )}
            {status === "denied" && (
              <p className="mt-1.5 text-xs text-amber-400">
                Access denied — you can try again anytime
              </p>
            )}
            {status === "error" && (
              <p className="mt-1.5 text-xs text-red-400">
                Something went wrong — please try again
              </p>
            )}
          </div>
        </div>

        {/* Action button */}
        {connected ? (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/50 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CalendarX2 className="h-3.5 w-3.5" />
            )}
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            style={{
              background: "#c97d14",
              color: "#0c0b09",
              boxShadow: loading ? "none" : "0 0 16px -4px rgba(201,125,20,0.5)",
            }}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Connect
          </button>
        )}
      </div>

      {/* Connected detail */}
      {connected && (
        <div className="relative mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.06] px-3 py-2">
          <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400/80">
            Syncing with primary calendar · AI checks for conflicts on every booking
          </span>
        </div>
      )}
    </div>
  );
}
