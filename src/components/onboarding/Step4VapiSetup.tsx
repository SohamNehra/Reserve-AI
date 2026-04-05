"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { OnboardingData } from "@/types";

type Status = "creating" | "done" | "error";

type Props = {
  data: OnboardingData;
  onSuccess: (businessId: string) => void;
  onError: (msg: string) => void;
};

const STEPS = [
  "Saving your business profile…",
  "Building your AI assistant…",
  "Connecting voice capabilities…",
  "Almost ready…",
];

export default function Step4VapiSetup({ data, onSuccess, onError }: Props) {
  const [status, setStatus] = useState<Status>("creating");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function create() {
      const interval = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
      }, 1200);

      try {
        const res = await fetch("/api/businesses/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        clearInterval(interval);

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? "Unknown error");
        }

        const result = await res.json();
        if (!cancelled) {
          setStatus("done");
          setTimeout(() => onSuccess(result.id), 800);
        }
      } catch (err) {
        clearInterval(interval);
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Something went wrong";
          setStatus("error");
          setErrorMsg(msg);
          onError(msg);
        }
      }
    }

    create();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 text-center">
      {status === "creating" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl animate-glow-pulse" style={{ background: "oklch(0.60 0.14 60 / 0.30)" }} />
            <Loader2 className="relative h-12 w-12 animate-spin" style={{ color: "#c97d14" }} />
          </div>
          <div>
            <p className="font-medium text-white">{STEPS[stepIndex]}</p>
            <p className="text-sm text-white/35 mt-1">This usually takes under 10 seconds</p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={i <= stepIndex
                  ? { width: "24px", background: "#c97d14" }
                  : { width: "6px", background: "rgba(255,255,255,0.10)" }
                }
              />
            ))}
          </div>
        </>
      )}

      {status === "done" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl" />
            <CheckCircle2 className="relative h-12 w-12 text-emerald-400" />
          </div>
          <p className="font-semibold text-white">Your AI receptionist is live!</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
            <XCircle className="relative h-12 w-12 text-red-400" />
          </div>
          <div>
            <p className="font-medium text-white">Something went wrong</p>
            <p className="text-sm text-red-400 mt-1">{errorMsg}</p>
          </div>
        </>
      )}
    </div>
  );
}
