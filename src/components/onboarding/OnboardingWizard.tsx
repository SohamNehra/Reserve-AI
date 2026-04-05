"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Step1BusinessInfo from "./Step1BusinessInfo";
import Step2WorkingHours from "./Step2WorkingHours";
import Step3SlotConfig from "./Step3SlotConfig";
import Step4VapiSetup from "./Step4VapiSetup";
import Step5Complete from "./Step5Complete";
import type { OnboardingData } from "@/types";
import { DEFAULT_WORKING_HOURS } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Business Info",   description: "Tell us about your business" },
  { title: "Working Hours",   description: "When are you open?" },
  { title: "Slot Settings",   description: "How long is each appointment?" },
  { title: "Setting Up",      description: "Building your AI receptionist…" },
  { title: "All Done!",       description: "Your assistant is live" },
];

const INITIAL_DATA: OnboardingData = {
  name: "",
  type: "restaurant",
  phone_number: "",
  timezone: "America/New_York",
  description: "",
  slot_duration_mins: 30,
  working_hours: DEFAULT_WORKING_HOURS,
};

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [setupError, setSetupError] = useState("");

  function patch(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function canProceed(): boolean {
    if (step === 1) return !!data.name.trim() && !!data.type && !!data.timezone;
    if (step === 2) return Object.values(data.working_hours).some((d) => d.enabled);
    return true;
  }

  function handleNext() {
    if (step < 4) setStep(step + 1);
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#0c0b09" }}>

      {/* Ambient orbs */}
      <div
        className="animate-blob pointer-events-none absolute -top-60 -right-60 h-[700px] w-[700px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #c97d14, transparent 70%)" }}
      />
      <div
        className="animate-blob-delay pointer-events-none absolute -bottom-60 -left-60 h-[600px] w-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #4a9e6b, transparent 70%)" }}
      />

      {/* Grid */}
      <div className="bg-grid-warm pointer-events-none absolute inset-0" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}>Reserve</span>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "#c97d14", color: "#0c0b09" }}>AI</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[520px]">

          {/* Step tracker */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                {STEPS.slice(0, 4).map((s, i) => {
                  const num = i + 1;
                  const done    = step > num;
                  const active  = step === num;
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                        style={
                          done
                            ? { background: "#c97d14", color: "#0c0b09" }
                            : active
                            ? { border: "2px solid #c97d14", background: "oklch(0.60 0.14 60 / 0.15)", color: "#c97d14" }
                            : { border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)" }
                        }
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : num}
                      </div>
                      {i < 3 && (
                        <div
                          className="h-px flex-1 min-w-[24px] transition-all duration-500"
                          style={{ background: done ? "oklch(0.60 0.14 60 / 0.50)" : "rgba(255,255,255,0.08)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <h2 className="text-xl font-semibold text-white">{STEPS[step - 1].title}</h2>
              <p className="text-sm text-white/45 mt-1">{STEPS[step - 1].description}</p>
            </div>
          )}

          {/* Card */}
          <div className="rounded-2xl p-6" style={{ background: "oklch(0.12 0.009 72)", border: "1px solid oklch(0.22 0.008 72 / 0.4)" }}>
            {step === 1 && <Step1BusinessInfo data={data} onChange={patch} />}
            {step === 2 && <Step2WorkingHours data={data} onChange={patch} />}
            {step === 3 && <Step3SlotConfig data={data} onChange={patch} />}
            {step === 4 && (
              <Step4VapiSetup
                data={data}
                onSuccess={() => setStep(5)}
                onError={(msg) => setSetupError(msg)}
              />
            )}
            {step === 5 && <Step5Complete />}
          </div>

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/40 transition-colors hover:text-white/70 disabled:pointer-events-none disabled:opacity-0"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
                style={{
                  background: "#c97d14",
                  color: "#0c0b09",
                  boxShadow: "0 0 20px -4px rgba(201,125,20,0.5)",
                }}
              >
                {step === 3 ? "Create My Assistant" : "Continue"}
              </button>
            </div>
          )}

          {/* Retry on error */}
          {step === 4 && setupError && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-sm text-red-400">{setupError}</p>
              <button
                onClick={() => { setSetupError(""); setStep(4); }}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
