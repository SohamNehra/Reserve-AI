import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { updateVapiAssistantWebhook } from "@/lib/vapi/client";

/** PATCH /api/businesses/update-webhook
 *  Patches the tool server URLs on the existing Vapi assistant to match
 *  the current NEXT_PUBLIC_APP_URL. Call this once after changing the URL
 *  (e.g. after starting ngrok or deploying to Vercel).
 */
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, vapi_assistant_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!business?.vapi_assistant_id) {
    return NextResponse.json({ error: "No business or assistant found" }, { status: 404 });
  }

  const webhookUrl    = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/vapi`;
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET!;

  try {
    await updateVapiAssistantWebhook(business.vapi_assistant_id, webhookUrl, webhookSecret);
    return NextResponse.json({ ok: true, webhookUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
