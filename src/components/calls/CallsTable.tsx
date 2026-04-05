"use client";

import { useState } from "react";
import CallOutcomeBadge from "./CallOutcomeBadge";
import TranscriptDrawer from "./TranscriptDrawer";
import type { Call } from "@/lib/supabase/types";

function formatDuration(secs: number | null): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

type Props = { calls: Call[] };

const TH = "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest";
const TD = "px-4 py-3 text-sm";

export default function CallsTable({ calls }: Props) {
  const [selected, setSelected] = useState<Call | null>(null);

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: "1px solid oklch(0.22 0.008 72 / 0.4)" }}
      >
        <table className="w-full">
          <thead style={{ background: "oklch(0.12 0.009 72)" }}>
            <tr style={{ borderBottom: "1px solid oklch(0.22 0.008 72 / 0.4)" }}>
              {["Time", "Caller", "Duration", "Outcome", "Reservation"].map((h) => (
                <th key={h} className={TH} style={{ color: "rgba(255,255,255,0.40)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
                  No calls yet — your AI phone is ready to receive calls
                </td>
              </tr>
            )}
            {calls.map((call, i) => (
              <tr
                key={call.id}
                className="cursor-pointer"
                onClick={() => setSelected(call)}
                style={{
                  background: i % 2 === 0 ? "oklch(0.10 0.007 72)" : "oklch(0.11 0.008 72)",
                  borderBottom: "1px solid oklch(0.22 0.008 72 / 0.25)",
                }}
              >
                <td className={TD} style={{ color: "rgba(255,255,255,0.55)" }}>{formatDate(call.created_at)}</td>
                <td className={`${TD} font-mono`} style={{ color: "#f0f0f0" }}>
                  {call.customer_phone ?? "Unknown"}
                </td>
                <td className={`${TD} font-mono`} style={{ color: "rgba(255,255,255,0.55)" }}>
                  {formatDuration(call.duration_seconds)}
                </td>
                <td className={TD}><CallOutcomeBadge outcome={call.outcome} /></td>
                <td className={TD}>
                  {call.reservation_id ? (
                    <span className="font-mono text-xs" style={{ color: "#c97d14" }}>
                      {call.reservation_id.slice(0, 8).toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ color: "#2e2b28" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TranscriptDrawer call={selected} onClose={() => setSelected(null)} />
    </>
  );
}
