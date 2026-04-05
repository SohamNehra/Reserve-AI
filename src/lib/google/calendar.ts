import { google } from "googleapis";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createAuthedOAuthClient } from "./oauth";
import type { Business } from "@/lib/supabase/types";

/**
 * Returns Google Calendar events for a given date (in the business's timezone)
 * as { startMins, endMins } in minutes-from-midnight (business timezone).
 * Returns [] if calendar not connected or on any error (fail open — don't block bookings).
 */
export async function getGCalBlockedMinutes(
  business: Business,
  dateStr: string,
): Promise<{ startMins: number; endMins: number }[]> {
  if (
    !business.google_calendar_connected ||
    !business.google_access_token ||
    !business.google_refresh_token
  ) {
    return [];
  }

  const oauth2Client = createAuthedOAuthClient(
    business.google_access_token,
    business.google_refresh_token,
    // Persist refreshed access token — fires automatically on token expiry
    async (newAccessToken) => {
      await supabaseAdmin
        .from("businesses")
        .update({ google_access_token: newAccessToken })
        .eq("id", business.id);
    },
  );

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const calendarId = business.google_calendar_id ?? "primary";

  // Build day boundaries in the business's timezone → convert to UTC for the API
  const dayStart = fromZonedTime(`${dateStr}T00:00:00`, business.timezone);
  const dayEnd   = fromZonedTime(`${dateStr}T23:59:59`, business.timezone);

  try {
    const res = await calendar.events.list({
      calendarId,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,   // expand recurring events
      orderBy: "startTime",
      maxResults: 250,
    });

    const items = res.data.items ?? [];

    return items
      .filter((e) => e.start?.dateTime && e.end?.dateTime) // skip all-day events
      .map((e) => {
        // Convert event times to business timezone, extract minutes-from-midnight
        const startLocal = toZonedTime(new Date(e.start!.dateTime!), business.timezone);
        const endLocal   = toZonedTime(new Date(e.end!.dateTime!),   business.timezone);
        return {
          startMins: startLocal.getHours() * 60 + startLocal.getMinutes(),
          endMins:   endLocal.getHours()   * 60 + endLocal.getMinutes(),
        };
      });
  } catch (err) {
    // Fail open: log but never block reservations due to GCal errors
    console.error("GCal fetch error for business", business.id, err);
    return [];
  }
}

/**
 * Create a Google Calendar event for a confirmed reservation.
 * Call this from the webhook after create_reservation succeeds.
 * Fails silently — a GCal write error must not fail the reservation.
 */
export async function createGCalEvent(
  business: Business,
  opts: {
    summary: string;
    dateStr: string;
    startTime: string; // "HH:MM"
    durationMins: number;
    description?: string;
  },
): Promise<void> {
  if (
    !business.google_calendar_connected ||
    !business.google_access_token ||
    !business.google_refresh_token
  ) {
    return;
  }

  const oauth2Client = createAuthedOAuthClient(
    business.google_access_token,
    business.google_refresh_token,
    async (newAccessToken) => {
      await supabaseAdmin
        .from("businesses")
        .update({ google_access_token: newAccessToken })
        .eq("id", business.id);
    },
  );

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const calendarId = business.google_calendar_id ?? "primary";

  // Build start/end in the business's timezone
  const startLocal = fromZonedTime(`${opts.dateStr}T${opts.startTime}:00`, business.timezone);
  const endLocal   = new Date(startLocal.getTime() + opts.durationMins * 60 * 1000);

  try {
    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: opts.summary,
        description: opts.description,
        start: { dateTime: startLocal.toISOString(), timeZone: business.timezone },
        end:   { dateTime: endLocal.toISOString(),   timeZone: business.timezone },
      },
    });
  } catch (err) {
    console.error("GCal event creation error:", err);
  }
}
