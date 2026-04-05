"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReservationStatusBadge from "./ReservationStatusBadge";
import CreateReservationDialog from "./CreateReservationDialog";
import EditReservationDialog from "./EditReservationDialog";
import { Zap } from "lucide-react";
import type { Reservation } from "@/lib/supabase/types";

type Props = { reservations: Reservation[] };

const TH = "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest";
const TD = "px-4 py-3 text-sm";

export default function ReservationTable({ reservations }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen]             = useState(false);
  const [editTarget, setEditTarget]             = useState<Reservation | null>(null);
  const [updating,   setUpdating]               = useState<string | null>(null);

  async function updateStatus(id: string, status: "cancelled" | "completed") {
    setUpdating(id);
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
          {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "#c97d14", color: "#0c0b09" }}
        >
          + New Reservation
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: "1px solid oklch(0.22 0.008 72 / 0.4)" }}
      >
        <table className="w-full">
          <thead style={{ background: "oklch(0.12 0.009 72)" }}>
            <tr style={{ borderBottom: "1px solid oklch(0.22 0.008 72 / 0.4)" }}>
              {["Customer", "Date", "Time", "Party", "Via", "Status", ""].map((h) => (
                <th key={h} className={TH} style={{ color: "rgba(255,255,255,0.40)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
                  No reservations yet
                </td>
              </tr>
            )}
            {reservations.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  background: i % 2 === 0 ? "oklch(0.10 0.007 72)" : "oklch(0.11 0.008 72)",
                  borderBottom: "1px solid oklch(0.22 0.008 72 / 0.25)",
                }}
              >
                <td className={TD}>
                  <p className="font-medium" style={{ color: "#f0f0f0" }}>{r.customer_name}</p>
                  {r.customer_phone && (
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{r.customer_phone}</p>
                  )}
                </td>
                <td className={TD} style={{ color: "rgba(255,255,255,0.55)" }}>{r.date}</td>
                <td className={`${TD} font-mono`} style={{ color: "rgba(255,255,255,0.55)" }}>{r.time_slot}</td>
                <td className={TD} style={{ color: "rgba(255,255,255,0.55)" }}>{r.party_size ?? "—"}</td>
                <td className={TD}>
                  {r.created_via === "voice" ? (
                    <span
                      className="flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{ background: "oklch(0.60 0.14 60 / 0.12)", color: "#c97d14", border: "1px solid oklch(0.60 0.14 60 / 0.25)" }}
                    >
                      <Zap className="h-2.5 w-2.5" /> AI
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>manual</span>
                  )}
                </td>
                <td className={TD}>
                  <ReservationStatusBadge status={r.status} />
                </td>
                <td className={TD}>
                  {r.status === "confirmed" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={updating === r.id}
                        onClick={() => setEditTarget(r)}
                        className="rounded-lg px-2.5 py-1 text-xs transition-colors disabled:opacity-40"
                        style={{ color: "rgba(255,255,255,0.60)", background: "oklch(0.16 0.009 72)" }}
                      >
                        Edit
                      </button>
                      <button
                        disabled={updating === r.id}
                        onClick={() => updateStatus(r.id, "completed")}
                        className="rounded-lg px-2.5 py-1 text-xs transition-colors disabled:opacity-40"
                        style={{ color: "#4a9e6b", background: "oklch(0.59 0.10 155 / 0.10)" }}
                      >
                        Complete
                      </button>
                      <button
                        disabled={updating === r.id}
                        onClick={() => updateStatus(r.id, "cancelled")}
                        className="rounded-lg px-2.5 py-1 text-xs transition-colors disabled:opacity-40"
                        style={{ color: "#c0604a", background: "oklch(0.60 0.20 25 / 0.10)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateReservationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {editTarget && (
        <EditReservationDialog
          reservation={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
