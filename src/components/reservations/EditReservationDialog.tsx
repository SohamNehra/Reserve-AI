"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { format12h } from "@/lib/format-time";
import type { Reservation } from "@/lib/supabase/types";

type Props = {
  reservation: Reservation;
  onClose: () => void;
};

const INPUT =
  "w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500/50";
const inputStyle = {
  background: "oklch(0.10 0.007 72)",
  border: "1px solid oklch(0.22 0.008 72 / 0.5)",
  color: "#ffffff",
};

export default function EditReservationDialog({ reservation, onClose }: Props) {
  const router = useRouter();

  const [date, setDate]           = useState(reservation.date);
  const [timeSlot, setTimeSlot]   = useState(reservation.time_slot);
  const [partySize, setPartySize] = useState<string>(reservation.party_size?.toString() ?? "");
  const [notes, setNotes]         = useState(reservation.notes ?? "");

  const [slots, setSlots]         = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Fetch available slots whenever date changes
  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then(({ slots: s }: { slots: string[] }) => {
        // Always include the current time_slot so user can keep it
        const all = Array.from(new Set([reservation.time_slot, ...s])).sort();
        setSlots(all);
        if (!all.includes(timeSlot)) setTimeSlot(all[0] ?? "");
      })
      .finally(() => setLoadingSlots(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        time_slot: timeSlot,
        party_size: partySize ? Number(partySize) : null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "oklch(0.12 0.009 72)", border: "1px solid oklch(0.22 0.008 72 / 0.5)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Reservation</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {reservation.customer_name}
              {reservation.customer_phone && ` · ${reservation.customer_phone}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.45)", background: "oklch(0.15 0.009 72)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={INPUT}
              style={inputStyle}
            />
          </div>

          {/* Time slot */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Time Slot
            </label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 py-2" style={{ color: "rgba(255,255,255,0.40)" }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading slots…</span>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm py-2" style={{ color: "rgba(255,255,255,0.40)" }}>
                No available slots on this date
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimeSlot(s)}
                    className="rounded-xl px-3 py-1.5 text-sm font-medium transition-all"
                    style={
                      timeSlot === s
                        ? { background: "#c97d14", color: "#0c0b09" }
                        : { background: "oklch(0.15 0.009 72)", color: "rgba(255,255,255,0.60)", border: "1px solid oklch(0.22 0.008 72 / 0.4)" }
                    }
                  >
                    {format12h(s)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Party size */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Party Size
            </label>
            <input
              type="number"
              min="1"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              placeholder="Number of guests"
              className={INPUT}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests…"
              rows={3}
              className={INPUT}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#c0604a" }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.55)", background: "oklch(0.15 0.009 72)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !timeSlot}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
