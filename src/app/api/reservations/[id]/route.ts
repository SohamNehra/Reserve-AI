import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, notes, party_size, date, time_slot } = body;

  // Scope update to the user's business (security check)
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const updatePayload: Record<string, unknown> = {};
  if (status    !== undefined) updatePayload.status    = status;
  if (notes     !== undefined) updatePayload.notes     = notes;
  if (party_size !== undefined) updatePayload.party_size = party_size;
  if (date      !== undefined) updatePayload.date      = date;
  if (time_slot !== undefined) updatePayload.time_slot = time_slot;

  const { data, error } = await supabaseAdmin
    .from("reservations")
    .update(updatePayload)
    .eq("id", id)
    .eq("business_id", business.id) // ensures user owns this reservation
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

  return NextResponse.json(data);
}
