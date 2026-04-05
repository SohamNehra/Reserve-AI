import Link from "next/link";
import { CalendarCheck, CalendarX2, Phone } from "lucide-react";

type Props = {
  businessName:  string;
  phoneNumber:   string | null;
  gcalConnected: boolean;
  todayCount:    number;
  monthCount:    number;
  callsCount:    number;
};

function Divider() {
  return <div className="h-px w-full" style={{ background: "oklch(0.22 0.008 72 / 0.4)" }} />;
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span
        className="text-lg leading-none"
        style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function LeftPanel({
  businessName, phoneNumber, gcalConnected, todayCount, monthCount, callsCount,
}: Props) {
  return (
    <aside
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r p-5 lg:flex"
      style={{
        backgroundColor: "oklch(0.10 0.007 72)",
        borderColor: "oklch(0.22 0.008 72 / 0.4)",
      }}
    >
      {/* Business name */}
      <div>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>
          Business
        </p>
        <h2
          className="mt-1 text-xl leading-snug"
          style={{ fontFamily: "var(--font-ubuntu)", color: "#d0c8bc" }}
        >
          {businessName}
        </h2>
      </div>

      <Divider />

      {/* AI Phone number */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Phone className="h-3 w-3" style={{ color: "#4a3820" }} />
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>
            AI Phone
          </p>
        </div>
        <p
          className="font-mono text-base tracking-wide"
          style={{ color: phoneNumber ? "#c97d14" : "rgba(255,255,255,0.40)" }}
        >
          {phoneNumber ?? "Not configured"}
        </p>
        {phoneNumber && (
          <p className="mt-1 text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            Customers call this to book
          </p>
        )}
      </div>

      <Divider />

      {/* Stats */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>
          Activity
        </p>
        <MiniStat label="Today's bookings"   value={todayCount}  />
        <MiniStat label="This month"         value={monthCount}  />
        <MiniStat label="AI calls (month)"   value={callsCount}  />
      </div>

      <Divider />

      {/* Integrations */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>
          Integrations
        </p>
        <Link href="/dashboard/settings?tab=integrations">
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors cursor-pointer"
            style={{
              background: gcalConnected ? "oklch(0.59 0.10 155 / 0.10)" : "oklch(0.14 0.008 72)",
              border: gcalConnected ? "1px solid oklch(0.59 0.10 155 / 0.25)" : "1px solid oklch(0.22 0.008 72 / 0.4)",
            }}
          >
            {gcalConnected ? (
              <CalendarCheck className="h-4 w-4 shrink-0" style={{ color: "#4a9e6b" }} />
            ) : (
              <CalendarX2 className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
            )}
            <div>
              <p className="text-xs font-medium" style={{ color: gcalConnected ? "#4a9e6b" : "rgba(255,255,255,0.45)" }}>
                Google Calendar
              </p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                {gcalConnected ? "Syncing" : "Not connected"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer note */}
      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
        ReserveAI · AI always online
      </p>
    </aside>
  );
}
