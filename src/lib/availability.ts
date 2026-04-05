import { supabaseAdmin } from "@/lib/supabase/server";
import { getGCalBlockedMinutes } from "@/lib/google/calendar";
import type { Business, WorkingHours } from "@/lib/supabase/types";
import type { DayKey } from "@/types";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format, parseISO } from "date-fns";

const DAY_INDEX_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDayKey(dateStr: string): DayKey {
  const date = parseISO(dateStr);
  return DAY_INDEX_TO_KEY[date.getUTCDay()];
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateSlots(open: string, close: string, durationMins: number): string[] {
  const slots: string[] = [];
  let current = parseMinutes(open);
  // "00:00" close means midnight (end of day) → treat as 24*60 = 1440
  let end = parseMinutes(close);
  if (end === 0 || end <= current) end = 24 * 60;
  while (current + durationMins <= end) {
    slots.push(minutesToTime(current));
    current += durationMins;
  }
  return slots;
}

export async function getAvailableSlots(
  business: Business,
  dateStr: string,
): Promise<string[]> {
  const wh = business.working_hours as WorkingHours;
  const dayKey = getDayKey(dateStr);
  const dayConfig = wh[dayKey];

  // Closed that day
  if (!dayConfig?.open || !dayConfig?.close) return [];

  const allSlots = generateSlots(dayConfig.open, dayConfig.close, business.slot_duration_mins);
  if (allSlots.length === 0) return [];

  // --- DB reservations ---
  const { data: reservations } = await supabaseAdmin
    .from("reservations")
    .select("time_slot")
    .eq("business_id", business.id)
    .eq("date", dateStr)
    .eq("status", "confirmed");

  const bookedSlots = new Set((reservations ?? []).map((r) => r.time_slot));

  // --- Past-slot filter (today only, business timezone) ---
  const nowInTz = toZonedTime(new Date(), business.timezone);
  const todayInTz = format(nowInTz, "yyyy-MM-dd");
  const nowMins = nowInTz.getHours() * 60 + nowInTz.getMinutes();

  // --- Google Calendar conflicts ---
  // Runs concurrently with nothing else blocking, so no extra latency beyond GCal RTT
  const gcalBlocked = await getGCalBlockedMinutes(business, dateStr);

  return allSlots.filter((slot) => {
    // Already booked in DB
    if (bookedSlots.has(slot)) return false;

    // Past slot (today only)
    if (dateStr === todayInTz && parseMinutes(slot) <= nowMins) return false;

    // Overlaps a Google Calendar event
    const slotStart = parseMinutes(slot);
    const slotEnd   = slotStart + business.slot_duration_mins;
    for (const { startMins, endMins } of gcalBlocked) {
      // Overlap = slotStart < eventEnd AND slotEnd > eventStart
      if (slotStart < endMins && slotEnd > startMins) return false;
    }

    return true;
  });
}

export { fromZonedTime };
