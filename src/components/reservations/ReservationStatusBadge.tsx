type Status = "confirmed" | "cancelled" | "completed";

const CONFIG: Record<Status, { label: string; bg: string; color: string; border: string }> = {
  confirmed: { label: "Confirmed", bg: "oklch(0.59 0.10 155 / 0.12)", color: "#4a9e6b", border: "oklch(0.59 0.10 155 / 0.28)" },
  cancelled: { label: "Cancelled", bg: "oklch(0.60 0.20 25 / 0.12)",  color: "#c0604a", border: "oklch(0.60 0.20 25 / 0.28)"  },
  completed: { label: "Completed", bg: "oklch(0.15 0.008 72)",        color: "#5a5348", border: "oklch(0.22 0.008 72 / 0.4)"  },
};

export default function ReservationStatusBadge({ status }: { status: Status }) {
  const c = CONFIG[status] ?? CONFIG.confirmed;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}
