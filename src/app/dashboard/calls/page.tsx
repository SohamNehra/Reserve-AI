import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import CallsTable from "@/components/calls/CallsTable";

export default async function CallsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: business } = await supabaseAdmin
    .from("businesses").select("id").eq("clerk_user_id", userId).maybeSingle();
  if (!business) redirect("/onboarding");

  const { data: calls } = await supabaseAdmin
    .from("calls").select("*").eq("business_id", business.id)
    .order("created_at", { ascending: false }).limit(50);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-instrument-serif)", color: "#c0b8ac" }}
        >
          Call Logs
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#3a3530" }}>
          Every inbound call handled by your AI receptionist
        </p>
      </div>
      <CallsTable calls={calls ?? []} />
    </div>
  );
}
