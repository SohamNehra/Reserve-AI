import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createReservation } from "@/lib/reservation";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const { customer_name, customer_phone, date, time_slot, party_size, notes } = body;

  if (!customer_name || !date || !time_slot) {
    return NextResponse.json({ error: "customer_name, date, and time_slot are required" }, { status: 400 });
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
      created_via: "manual",
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create reservation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  let query = supabaseAdmin
    .from("reservations")
    .select("*")
    .eq("business_id", business.id)
    .order("date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (date) query = query.eq("date", date);
  if (status) query = query.eq("status", status as "confirmed" | "cancelled" | "completed");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
