import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";
import { PhoneCall, CalendarCheck, Zap, ArrowRight, Clock, Shield } from "lucide-react";

export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    const { data: business } = await supabaseAdmin
      .from("businesses").select("id").eq("clerk_user_id", userId).maybeSingle();
    redirect(business ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#0c0b09" }}>
      {/* Background */}
      <div
        className="animate-blob pointer-events-none fixed right-0 top-0 h-[700px] w-[700px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #c97d14, transparent 70%)" }}
      />
      <div
        className="animate-blob-delay pointer-events-none fixed bottom-0 left-0 h-[600px] w-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #4a9e6b, transparent 70%)" }}
      />
      <div className="bg-grid-warm pointer-events-none fixed inset-0" />

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <header
        className="relative z-20 flex h-16 items-center justify-between border-b px-8"
        style={{ borderColor: "oklch(0.22 0.008 72 / 0.4)", backgroundColor: "oklch(0.08 0.006 72 / 0.9)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xl leading-none"
            style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
          >
            Reserve
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >
            AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-8 pt-28 pb-20 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-widest"
          style={{ border: "1px solid oklch(0.60 0.14 60 / 0.3)", color: "#c97d14", background: "oklch(0.60 0.14 60 / 0.08)" }}
        >
          <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full" style={{ background: "#c97d14" }} />
          AI-powered voice reservations
        </div>

        <h1
          className="mx-auto max-w-3xl text-6xl leading-[1.05] md:text-7xl"
          style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
        >
          Your business never misses a{" "}
          <span style={{ color: "#c97d14" }}>reservation</span>{" "}
          again.
        </h1>

        <p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          An AI receptionist that answers every inbound call, understands your customers,
          and books reservations in real time — around the clock, without you lifting a finger.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-base font-semibold transition-all hover:scale-[1.02] glow-amber"
            style={{ background: "#c97d14", color: "#0c0b09" }}
          >
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="rounded-2xl px-8 py-3.5 text-base transition-all"
            style={{
              border: "1px solid oklch(0.22 0.008 72 / 0.5)",
              color: "rgba(255,255,255,0.55)",
              background: "oklch(0.12 0.009 72)",
            }}
          >
            Sign in →
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mx-auto mt-16 grid max-w-lg grid-cols-3 rounded-2xl py-6"
          style={{
            border: "1px solid oklch(0.22 0.008 72 / 0.4)",
            background: "oklch(0.12 0.009 72)",
          }}
        >
          {[
            { value: "24/7",  label: "Always online"    },
            { value: "< 2s",  label: "Response time"    },
            { value: "100%",  label: "Calls answered"   },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 px-6"
              style={i > 0 ? { borderLeft: "1px solid oklch(0.22 0.008 72 / 0.4)" } : undefined}
            >
              <span
                className="text-3xl leading-none"
                style={{ fontFamily: "var(--font-ubuntu)", color: "#c97d14" }}
              >
                {value}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-8 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#c97d14" }}>How it works</p>
          <h2
            className="text-4xl"
            style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
          >
            Three steps. Zero effort.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: PhoneCall,
              title: "Customer calls",
              body: "Your AI phone number rings. The AI answers instantly, in your business's voice and tone.",
            },
            {
              step: "02",
              icon: CalendarCheck,
              title: "AI checks availability",
              body: "It looks up your real-time schedule, Google Calendar, and existing bookings to find open slots.",
            },
            {
              step: "03",
              icon: Zap,
              title: "Reservation confirmed",
              body: "Booking is created instantly in your dashboard and synced to Google Calendar. You get notified.",
            },
          ].map(({ step, icon: Icon, title, body }) => (
            <div
              key={step}
              className="relative rounded-2xl p-6"
              style={{
                background: "oklch(0.12 0.009 72)",
                border: "1px solid oklch(0.22 0.008 72 / 0.4)",
              }}
            >
              <div className="flex items-start gap-4">
                <div>
                  <p
                    className="text-4xl leading-none mb-4"
                    style={{ fontFamily: "var(--font-ubuntu)", color: "oklch(0.22 0.008 72)" }}
                  >
                    {step}
                  </p>
                  <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "oklch(0.60 0.14 60 / 0.12)", border: "1px solid oklch(0.60 0.14 60 / 0.25)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "#c97d14" }} />
                  </div>
                  <h3
                    className="text-lg mb-2"
                    style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-8 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#c97d14" }}>Features</p>
          <h2
            className="text-4xl"
            style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
          >
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "Always Available",
              body: "Your AI picks up every call, even at 2am. No missed bookings, no voicemails.",
            },
            {
              icon: CalendarCheck,
              title: "Google Calendar Sync",
              body: "Connect your Google Calendar and the AI automatically avoids double-booking existing events.",
            },
            {
              icon: PhoneCall,
              title: "Natural Conversation",
              body: "Powered by GPT-4o. Customers have natural conversations — not robotic phone trees.",
            },
            {
              icon: Zap,
              title: "Instant Setup",
              body: "5-step onboarding. Your AI assistant is live in under 5 minutes with your business's details.",
            },
            {
              icon: Shield,
              title: "Your Voice & Brand",
              body: "Customize the AI's personality, name, and knowledge base to match your business exactly.",
            },
            {
              icon: CalendarCheck,
              title: "Full Dashboard",
              body: "See every reservation, call log, and slot availability in one clean dashboard. Always in control.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl p-5 transition-all hover:border-amber/30"
              style={{
                background: "oklch(0.10 0.007 72)",
                border: "1px solid oklch(0.22 0.008 72 / 0.35)",
              }}
            >
              <div
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "oklch(0.60 0.14 60 / 0.10)", border: "1px solid oklch(0.60 0.14 60 / 0.20)" }}
              >
                <Icon className="h-4 w-4" style={{ color: "#c97d14" }} />
              </div>
              <h3
                className="mb-2 text-base"
                style={{ fontFamily: "var(--font-ubuntu)", color: "#f0f0f0" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-8 py-20">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: "oklch(0.12 0.009 72)",
            border: "1px solid oklch(0.60 0.14 60 / 0.20)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.60 0.14 60 / 0.15), transparent 70%)" }}
          />
          <div className="relative">
            <h2
              className="text-5xl mb-4"
              style={{ fontFamily: "var(--font-ubuntu)", color: "#ffffff" }}
            >
              Ready to never miss a booking?
            </h2>
            <p className="mb-8 text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
              Set up your AI receptionist in 5 minutes. Free to start.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-semibold transition-all hover:scale-[1.02] glow-amber"
              style={{ background: "#c97d14", color: "#0c0b09" }}
            >
              Get started for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t px-8 py-8"
        style={{ borderColor: "oklch(0.22 0.008 72 / 0.4)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-base leading-none"
              style={{ fontFamily: "var(--font-ubuntu)", color: "rgba(255,255,255,0.45)" }}
            >
              Reserve
            </span>
            <span
              className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: "oklch(0.60 0.14 60 / 0.20)", color: "#c97d14" }}
            >
              AI
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 ReserveAI · AI always online
          </p>
        </div>
      </footer>
    </div>
  );
}
