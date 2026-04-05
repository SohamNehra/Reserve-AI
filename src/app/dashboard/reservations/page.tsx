import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ReservationTable from "@/components/reservations/ReservationTable";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date, status } = await searchParams;

  const { data: business } = await supabaseAdmin
    .from("businesses").select("id").eq("clerk_user_id", userId).maybeSingle();
  if (!business) redirect("/onboarding");

  let query = supabaseAdmin
    .from("reservations").select("*").eq("business_id", business.id)
    .order("date", { ascending: false }).order("time_slot", { ascending: true });

  if (date)   query = query.eq("date", date);
  if (status) query = query.eq("status", status as "confirmed" | "cancelled" | "completed");

  const { data: reservations } = await query;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
        >
          Reservations
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
          All bookings managed by your AI receptionist
        </p>
      </div>
      <ReservationTable reservations={reservations ?? []} />
    </div>
  );
}
