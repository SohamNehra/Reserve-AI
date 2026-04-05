"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone, LayoutDashboard } from "lucide-react";

export default function Step5Complete() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-6 text-center">
      <CheckCircle2 className="h-14 w-14 text-green-500" />

      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">You&apos;re all set!</h2>
        <p className="text-zinc-500 mt-2 max-w-sm">
          Your AI phone receptionist is live. Customers can now call your Vapi
          number to make reservations — 24/7, no staff required.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 flex items-center gap-3 text-sm text-zinc-600">
          <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>Your AI phone number is visible in the dashboard</span>
        </div>

        <Button
          className="w-full"
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
