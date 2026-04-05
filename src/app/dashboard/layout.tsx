import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import TopNav from "@/components/dashboard/TopNav";
import LeftPanel from "@/components/dashboard/LeftPanel";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const today      = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const [todayRes, monthRes, callsRes] = await Promise.all([
    supabaseAdmin
      .from("reservations").select("id", { count: "exact" })
      .eq("business_id", business.id).eq("date", today).eq("status", "confirmed"),
    supabaseAdmin
      .from("reservations").select("id", { count: "exact" })
      .eq("business_id", business.id).gte("date", monthStart).eq("status", "confirmed"),
    supabaseAdmin
      .from("calls").select("id", { count: "exact" })
      .eq("business_id", business.id).gte("created_at", monthStart),
  ]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0c0b09" }}>
      <TopNav businessName={business.name} />

      <div className="flex flex-1">
        <LeftPanel
          businessName={business.name}
          phoneNumber={business.phone_number}
          gcalConnected={business.google_calendar_connected}
          todayCount={todayRes.count  ?? 0}
          monthCount={monthRes.count  ?? 0}
          callsCount={callsRes.count  ?? 0}
        />

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
