import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div
      className="relative min-h-screen flex overflow-hidden"
      style={{ backgroundColor: "#0c0b09" }}
    >
      <div
        className="animate-blob pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #c97d14, transparent 70%)" }}
      />
      <div
        className="animate-blob-delay pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #4a9e6b, transparent 70%)" }}
      />
      <div className="bg-grid-warm pointer-events-none absolute inset-0" />

      {/* Left — brand */}
      <div
        className="relative z-10 hidden w-[52%] flex-col justify-between p-16 lg:flex border-r"
        style={{ borderColor: "oklch(0.22 0.008 72 / 0.4)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-2xl leading-none"
            style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
          >Reserve</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >AI</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#c97d14" }}>
              Set up in under 5 minutes
            </p>
            <h1
              className="text-5xl leading-[1.1]"
              style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
            >
              Your AI receptionist
              <br />
              <span style={{ color: "#c97d14" }}>is waiting for you.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Create an account, complete a quick 5-step setup, and your AI assistant
              starts taking calls immediately.
            </p>
          </div>

          <div
            className="flex gap-10 pt-8 border-t"
            style={{ borderColor: "oklch(0.22 0.008 72 / 0.4)" }}
          >
            {[
              { value: "5 min", label: "Setup time"    },
              { value: "24/7",  label: "Always online" },
              { value: "Free",  label: "To start"      },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="text-3xl leading-none"
                  style={{ fontFamily: "var(--font-ubuntu)", color: "#c97d14" }}
                >
                  {value}
                </p>
                <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>© 2026 ReserveAI</p>
      </div>

      {/* Right — auth */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span
            className="text-xl"
            style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
          >Reserve</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >AI</span>
        </div>

        <SignUp
          appearance={{
            variables: {
              colorPrimary:         "#c97d14",
              colorBackground:      "#0f0e0b",
              colorText:            "#ffffff",
              colorTextSecondary:   "rgba(255,255,255,0.50)",
              colorInputBackground: "#141210",
              colorInputText:       "#ffffff",
              colorDanger:          "#c0604a",
              borderRadius:         "10px",
              colorNeutral:         "rgba(255,255,255,0.40)",
            },
          }}
        />

        <p className="mt-6 text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
          Already have an account?{" "}
          <Link href="/sign-in" className="underline" style={{ color: "#c97d14" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
