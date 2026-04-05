import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = [
  "name",
  "type",
  "description",
  "phone_number",
  "timezone",
  "slot_duration_mins",
  "working_hours",
] as const;

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Whitelist fields — never let the client update clerk_user_id, tokens, etc.
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key] === "" ? null : body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("businesses")
    .update(updates)
    .eq("clerk_user_id", userId);

  if (error) {
    console.error("Business update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
