import { supabaseAdmin } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/availability";
import { createReservation } from "@/lib/reservation";
import { createGCalEvent } from "@/lib/google/calendar";
import type { Business } from "@/lib/supabase/types";

// Vapi event shapes
type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
};

type VapiToolCallEvent = {
  type: "tool-calls";
  toolCallList: ToolCall[];
  call: { assistantId: string; id: string; customer?: { number?: string } };
};

type VapiCallEndEvent = {
  type: "end-of-call-report";
  call: {
    id: string;
    assistantId: string;
    customer?: { number?: string };
    startedAt?: string;
    endedAt?: string;
  };
  durationSeconds?: number;
  transcript?: string;
  summary?: string;
};

type VapiEvent = VapiToolCallEvent | VapiCallEndEvent | { type: string };

function toolResult(toolCallId: string, result: string) {
  return Response.json({ results: [{ toolCallId, result }] });
}

async function getBusiness(assistantId: string): Promise<Business | null> {
  const { data } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("vapi_assistant_id", assistantId)
    .maybeSingle();
  return data;
}

export async function POST(req: Request) {
  // 1. Authenticate — must be first
  const secret = req.headers.get("x-vapi-secret");
  if (secret !== process.env.VAPI_WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();

  // Vapi may wrap the event under `message`; `call` stays at root in that case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  const eventType: string = r.message?.type ?? r.type ?? "";
  const toolCallList: unknown[] = r.message?.toolCallList ?? r.toolCallList ?? [];
  const call = r.message?.call ?? r.call ?? {};

  console.log("[vapi-webhook] type:", eventType, "call.assistantId:", call?.assistantId);

  // 2. Handle tool calls
  if (eventType === "tool-calls") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCall = toolCallList[0] as any;
    if (!toolCall) return Response.json({ results: [] });

    console.log("[vapi-webhook] toolCall:", JSON.stringify(toolCall));

    // Handle both payload shapes:
    // Shape A (OpenAI style): { id, function: { name, arguments: "json string" } }
    // Shape B (Vapi style):   { id, name, parameters: { ... } }
    const toolCallId: string = toolCall.id;
    const fnName: string = toolCall.function?.name ?? toolCall.name ?? "";
    const args: Record<string, unknown> =
      typeof toolCall.function?.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : (toolCall.function?.arguments ?? toolCall.parameters ?? {});

    const business = await getBusiness(call.assistantId);
    if (!business) {
      return toolResult(toolCallId, "Sorry, I'm unable to process reservations right now.");
    }

    // check_availability
    if (fnName === "check_availability") {
      const { date } = args as { date: string };
      if (!date) {
        return toolResult(toolCallId, "Please provide a date to check availability.");
      }

      try {
        const slots = await getAvailableSlots(business, date);
        if (slots.length === 0) {
          return toolResult(
            toolCallId,
            `No availability on ${date}. The business may be closed or fully booked.`
          );
        }
        return toolResult(
          toolCallId,
          `Available slots on ${date}: ${slots.join(", ")}`
        );
      } catch (err) {
        console.error("check_availability error:", err);
        return toolResult(toolCallId, "Unable to check availability right now.");
      }
    }

    // create_reservation
    if (fnName === "create_reservation") {
      const { date, time_slot, customer_name, customer_phone, party_size, notes } = args as {
        date: string;
        time_slot: string;
        customer_name: string;
        customer_phone?: string;
        party_size?: number;
        notes?: string;
      };

      if (!date || !time_slot || !customer_name) {
        return toolResult(toolCallId, "Missing required fields: date, time, or customer name.");
      }

      // Verify slot is still available before booking
      const slots = await getAvailableSlots(business, date);
      if (!slots.includes(time_slot)) {
        return toolResult(
          toolCallId,
          `The ${time_slot} slot on ${date} is no longer available. Available times: ${slots.slice(0, 5).join(", ")}`
        );
      }

      try {
        const reservation = await createReservation({
          business_id: business.id,
          customer_name,
          customer_phone: customer_phone ?? null,
          date,
          time_slot,
          party_size: party_size ?? null,
          notes: notes ?? null,
          created_via: "voice",
          vapi_call_id: call.id,
        });

        // Update calls table with reservation link if call record exists
        await supabaseAdmin
          .from("calls")
          .update({ reservation_id: reservation.id, outcome: "reservation_created" })
          .eq("vapi_call_id", call.id);

        // Mirror to Google Calendar — fails silently, never blocks the response
        createGCalEvent(business, {
          summary: `${customer_name}${party_size ? ` (${party_size})` : ""} — ${business.name}`,
          dateStr: date,
          startTime: time_slot,
          durationMins: business.slot_duration_mins,
          description: notes ?? undefined,
        }).catch(() => {});

        const partyInfo = party_size ? ` for ${party_size}` : "";
        return toolResult(
          toolCallId,
          `Reservation confirmed! ${customer_name}${partyInfo} on ${date} at ${time_slot}. Confirmation ID: ${reservation.id.slice(0, 8).toUpperCase()}.`
        );
      } catch (err) {
        console.error("create_reservation error:", err);
        return toolResult(toolCallId, "Unable to create the reservation right now. Please try again.");
      }
    }

    return toolResult(toolCallId, "Unknown tool called.");
  }

  // 3. Handle call ended — log to calls table
  if (eventType === "end-of-call-report") {
    const endEvent = (r.message ?? r) as VapiCallEndEvent;
    const { durationSeconds, transcript } = endEvent;

    const business = await getBusiness(call.assistantId);
    if (!business) return Response.json({ ok: true });

    // Upsert so duplicate end-of-call events don't create duplicate rows
    await supabaseAdmin.from("calls").upsert(
      {
        business_id: business.id,
        vapi_call_id: call.id,
        customer_phone: call.customer?.number ?? null,
        duration_seconds: durationSeconds ?? null,
        transcript: transcript ? { text: transcript } : null,
        outcome: "hung_up", // default; overridden above if reservation was created
      },
      { onConflict: "vapi_call_id", ignoreDuplicates: false }
    );

    return Response.json({ ok: true });
  }

  // 4. All other event types — acknowledge
  return Response.json({ ok: true });
}
