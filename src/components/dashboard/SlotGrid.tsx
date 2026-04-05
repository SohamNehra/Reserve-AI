type SlotStatus = "available" | "booked" | "past";

type Slot = {
  time: string;
  status: SlotStatus;
};

type Props = {
  slots: Slot[];
  dateLabel: string;
};

const STATUS_STYLES: Record<SlotStatus, { bg: string; text: string; border: string; label: string }> = {
  available: {
    bg:     "oklch(0.59 0.10 155 / 0.12)",
    border: "oklch(0.59 0.10 155 / 0.30)",
    text:   "#4a9e6b",
    label:  "Open",
  },
  booked: {
    bg:     "oklch(0.60 0.14 60 / 0.12)",
    border: "oklch(0.60 0.14 60 / 0.30)",
    text:   "#c97d14",
    label:  "Booked",
  },
  past: {
    bg:     "oklch(0.14 0.008 72)",
    border: "oklch(0.20 0.008 72 / 0.4)",
    text:   "#2e2b28",
    label:  "Past",
  },
};

export default function SlotGrid({ slots, dateLabel }: Props) {
  const available = slots.filter((s) => s.status === "available").length;
  const booked    = slots.filter((s) => s.status === "booked").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h3
          className="text-lg"
          style={{ fontFamily: "var(--font-instrument-serif)", color: "#c0b8ac" }}
        >
          Today's Schedule
          <span className="ml-2 text-sm font-normal" style={{ color: "#4a4138", fontFamily: "var(--font-dm-sans)" }}>
            {dateLabel}
          </span>
        </h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: "#4a4138" }}>
          <span>
            <span style={{ color: "#4a9e6b" }}>{available}</span> open
          </span>
          <span>
            <span style={{ color: "#c97d14" }}>{booked}</span> booked
          </span>
        </div>
      </div>

      {/* Grid */}
      {slots.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-2xl py-12 text-sm"
          style={{ border: "1px solid oklch(0.22 0.008 72 / 0.4)", color: "#3a3530" }}
        >
          Closed today — no slots configured
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const s = STATUS_STYLES[slot.status];
            return (
              <div
                key={slot.time}
                className="flex flex-col items-center rounded-xl px-3 py-2 transition-all"
                style={{ background: s.bg, border: `1px solid ${s.border}`, minWidth: "68px" }}
              >
                <span
                  className="font-mono text-sm font-medium tracking-wide"
                  style={{ color: s.text }}
                >
                  {slot.time}
                </span>
                <span className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: s.text, opacity: 0.6 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
