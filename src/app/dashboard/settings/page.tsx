import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import SettingsTabs from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: business } = await supabaseAdmin
    .from("businesses").select("*").eq("clerk_user_id", userId).maybeSingle();
  if (!business) redirect("/onboarding");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
          Manage your business profile, hours, and integrations
        </p>
      </div>
      <SettingsTabs business={business} />
    </div>
  );
}
