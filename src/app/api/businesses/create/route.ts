import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createVapiAssistant, deleteVapiAssistant } from "@/lib/vapi/client";
import { buildSystemPrompt } from "@/lib/vapi/prompts";
import type { OnboardingData, DayKey } from "@/types";
import type { WorkingHours } from "@/lib/supabase/types";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Idempotency: return existing business if already created
  const { data: existing } = await supabaseAdmin
    .from("businesses")
    .select("id, vapi_assistant_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  const body: OnboardingData = await req.json();

  // Convert form working hours to DB shape (only enabled days, no `enabled` field)
  const working_hours: WorkingHours = {};
  (Object.keys(body.working_hours) as DayKey[]).forEach((day) => {
    const d = body.working_hours[day];
    if (d.enabled) {
      working_hours[day] = { open: d.open, close: d.close };
    } else {
      working_hours[day] = null;
    }
  });

  // Build a temporary business object for the prompt builder
  const tempBusiness = {
    id: "",
    clerk_user_id: userId,
    name: body.name,
    type: body.type,
    description: body.description,
    phone_number: body.phone_number,
    timezone: body.timezone,
    slot_duration_mins: body.slot_duration_mins,
    working_hours,
    vapi_assistant_id: null,
    vapi_phone_number_id: null,
    google_calendar_connected: false,
    google_access_token: null,
    google_refresh_token: null,
    google_calendar_id: null,
    created_at: new Date().toISOString(),
  };

  const systemPrompt = buildSystemPrompt(tempBusiness);
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/vapi`;
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET!;

  // Create Vapi assistant
  let vapiAssistantId: string;
  try {
    vapiAssistantId = await createVapiAssistant({
      name: body.name,
      systemPrompt,
      webhookUrl,
      webhookSecret,
    });
  } catch (err) {
    console.error("Vapi assistant creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create voice assistant. Please try again." },
      { status: 500 }
    );
  }

  // Insert business into DB — rollback Vapi assistant if this fails
  const { data: business, error: dbError } = await supabaseAdmin
    .from("businesses")
    .insert({
      clerk_user_id: userId,
      name: body.name,
      type: body.type,
      description: body.description || null,
      phone_number: body.phone_number || null,
      timezone: body.timezone,
      slot_duration_mins: body.slot_duration_mins,
      working_hours,
      vapi_assistant_id: vapiAssistantId,
      vapi_phone_number_id: process.env.VAPI_PHONE_NUMBER_ID || null,
    })
    .select()
    .single();

  if (dbError || !business) {
    console.error("DB insert failed, rolling back Vapi assistant:", dbError);
    await deleteVapiAssistant(vapiAssistantId);
    return NextResponse.json(
      { error: "Failed to save business. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: business.id, vapi_assistant_id: vapiAssistantId });
}
