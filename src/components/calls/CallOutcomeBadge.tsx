type Outcome = "reservation_created" | "no_availability" | "hung_up" | "transferred" | null;

const CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  reservation_created: { label: "Booked",       bg: "oklch(0.59 0.10 155 / 0.12)", color: "#4a9e6b", border: "oklch(0.59 0.10 155 / 0.28)" },
  no_availability:     { label: "No Slots",     bg: "oklch(0.60 0.14 60 / 0.12)",  color: "#c97d14", border: "oklch(0.60 0.14 60 / 0.28)"  },
  hung_up:             { label: "Hung Up",      bg: "oklch(0.15 0.008 72)",        color: "#4a4138", border: "oklch(0.22 0.008 72 / 0.4)"  },
  transferred:         { label: "Transferred",  bg: "oklch(0.55 0.12 230 / 0.12)", color: "#5a8ec0", border: "oklch(0.55 0.12 230 / 0.28)" },
  unknown:             { label: "Unknown",      bg: "oklch(0.15 0.008 72)",        color: "#3a3530", border: "oklch(0.22 0.008 72 / 0.35)" },
};

export default function CallOutcomeBadge({ outcome }: { outcome: Outcome }) {
  const c = CONFIG[outcome ?? "unknown"] ?? CONFIG.unknown;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}
