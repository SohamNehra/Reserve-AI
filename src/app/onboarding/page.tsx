import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // If business already exists, skip onboarding
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (business) redirect("/dashboard");

  return <OnboardingWizard />;
}
