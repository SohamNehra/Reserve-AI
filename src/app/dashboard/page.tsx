import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import SlotGrid from "@/components/dashboard/SlotGrid";
import ReservationStatusBadge from "@/components/reservations/ReservationStatusBadge";
import GoogleCalendarCard from "@/components/dashboard/GoogleCalendarCard";
import { Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { WorkingHours } from "@/lib/supabase/types";
import type { DayKey } from "@/types";

const DAY_INDEX_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function generateSlots(open: string, close: string, duration: number): string[] {
  const slots: string[] = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  while (cur + duration <= end) {
    const h = Math.floor(cur / 60), m = cur % 60;
    slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    cur += duration;
  }
  return slots;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: business } = await supabaseAdmin
    .from("businesses").select("*").eq("clerk_user_id", userId).maybeSingle();
  if (!business) redirect("/onboarding");

  // ── Today's slots ────────────────────────────────────────────────
  const nowInTz   = toZonedTime(new Date(), business.timezone);
  const todayStr  = format(nowInTz, "yyyy-MM-dd");
  const nowMins   = nowInTz.getHours() * 60 + nowInTz.getMinutes();
  const dayKey    = DAY_INDEX_TO_KEY[parseISO(todayStr).getUTCDay()];
  const wh        = business.working_hours as WorkingHours;
  const dayConfig = wh[dayKey];

  const allSlots = dayConfig?.open && dayConfig?.close
    ? generateSlots(dayConfig.open, dayConfig.close, business.slot_duration_mins)
    : [];

  const { data: todayReservations } = await supabaseAdmin
    .from("reservations").select("time_slot")
    .eq("business_id", business.id).eq("date", todayStr).eq("status", "confirmed");

  const bookedSet = new Set((todayReservations ?? []).map((r) => r.time_slot));

  const slots = allSlots.map((time) => {
    const [h, m] = time.split(":").map(Number);
    const slotMins = h * 60 + m;
    const status =
      slotMins + business.slot_duration_mins <= nowMins ? "past"
      : bookedSet.has(time) ? "booked"
      : "available";
    return { time, status } as { time: string; status: "available" | "booked" | "past" };
  });

  const dateLabel = format(nowInTz, "EEEE, MMMM d");

  // ── Upcoming ─────────────────────────────────────────────────────
  const { data: upcoming } = await supabaseAdmin
    .from("reservations").select("*")
    .eq("business_id", business.id).gte("date", todayStr).eq("status", "confirmed")
    .order("date", { ascending: true }).order("time_slot", { ascending: true })
    .limit(6);

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Slot grid */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "oklch(0.12 0.009 72)", border: "1px solid oklch(0.22 0.008 72 / 0.4)" }}
      >
        <SlotGrid slots={slots} dateLabel={dateLabel} />
      </div>

      {/* Google Calendar card (with post-OAuth feedback) */}
      {google && (
        <GoogleCalendarCard
          connected={business.google_calendar_connected}
          googleParam={google}
        />
      )}

      {/* Upcoming reservations */}
      <div>
        <h3
          className="mb-4 text-lg"
          style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
        >
          Upcoming
        </h3>

        {(upcoming?.length ?? 0) === 0 ? (
          <div
            className="flex items-center justify-center rounded-2xl py-12 text-sm"
            style={{ border: "1px dashed oklch(0.22 0.008 72 / 0.4)", color: "rgba(255,255,255,0.40)" }}
          >
            No upcoming reservations
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming!.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{
                  background: "oklch(0.12 0.009 72)",
                  border: "1px solid oklch(0.22 0.008 72 / 0.35)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ background: "oklch(0.15 0.009 72)", color: "rgba(255,255,255,0.55)" }}
                  >
                    {r.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#f0f0f0" }}>
                      {r.customer_name}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {r.date} · {r.time_slot}
                      {r.party_size ? ` · ${r.party_size} guests` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.created_via === "voice" && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{ background: "oklch(0.60 0.14 60 / 0.15)", color: "#c97d14", border: "1px solid oklch(0.60 0.14 60 / 0.25)" }}
                    >
                      <Zap className="h-2.5 w-2.5" /> AI
                    </span>
                  )}
                  <ReservationStatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
