import { supabaseAdmin } from "@/lib/supabase/server";
import type { Reservation } from "@/lib/supabase/types";

export type CreateReservationInput = {
  business_id: string;
  customer_name: string;
  customer_phone?: string | null;
  date: string;       // "YYYY-MM-DD"
  time_slot: string;  // "HH:MM"
  party_size?: number | null;
  notes?: string | null;
  created_via?: "voice" | "manual";
  vapi_call_id?: string | null;
};

export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .insert({
      business_id: input.business_id,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone ?? null,
      date: input.date,
      time_slot: input.time_slot,
      party_size: input.party_size ?? null,
      notes: input.notes ?? null,
      status: "confirmed",
      created_via: input.created_via ?? "manual",
      vapi_call_id: input.vapi_call_id ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create reservation");
  }

  return data;
}
