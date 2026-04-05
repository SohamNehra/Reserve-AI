"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import GoogleCalendarCard from "@/components/dashboard/GoogleCalendarCard";
import {
  Check, Copy, Loader2, User, Clock, Mic, Plug,
} from "lucide-react";
import type { Business } from "@/lib/supabase/types";
import type { DayKey } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DayForm = { enabled: boolean; open: string; close: string };
type HoursForm = Record<DayKey, DayForm>;

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday",  sat: "Saturday", sun: "Sunday",
};

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Phoenix", "America/Anchorage",
  "Pacific/Honolulu", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney",
];

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "clinic",     label: "Clinic"     },
  { value: "salon",      label: "Salon"      },
  { value: "other",      label: "Other"      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dbHoursToForm(wh: Business["working_hours"]): HoursForm {
  const form = {} as HoursForm;
  for (const day of DAY_KEYS) {
    const d = (wh as Record<string, { open: string; close: string } | null>)[day];
    form[day] = {
      enabled: !!d,
      open:  d?.open  ?? "09:00",
      close: d?.close ?? "17:00",
    };
  }
  return form;
}

function formHoursToDb(form: HoursForm) {
  const db: Record<string, { open: string; close: string } | null> = {};
  for (const day of DAY_KEYS) {
    db[day] = form[day].enabled ? { open: form[day].open, close: form[day].close } : null;
  }
  return db;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
      style={{ background: "#c97d14", boxShadow: "0 0 16px -4px rgba(201,125,20,.4)", color: "#0c0b09" }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
      {loading ? "Saving…" : saved ? "Saved!" : "Save changes"}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-white/40 mb-1.5">{children}</label>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-5">
      {children}
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={value || "—"}
          className="h-9 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 font-mono text-xs text-white/50 outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-white/40 transition-colors hover:text-white/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { business: Business };

export default function SettingsTabs({ business }: Props) {
  const router = useRouter();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:        business.name,
    type:        business.type,
    description: business.description ?? "",
    phone_number:business.phone_number ?? "",
    timezone:    business.timezone,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved,   setProfileSaved]   = useState(false);

  // ── Hours state ────────────────────────────────────────────────────────────
  const [hours, setHours] = useState<HoursForm>(() =>
    dbHoursToForm(business.working_hours)
  );
  const [slotDuration, setSlotDuration] = useState(business.slot_duration_mins);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [hoursSaved,   setHoursSaved]   = useState(false);

  // ── Patch helper ───────────────────────────────────────────────────────────
  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/businesses/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Update failed");
    }
    router.refresh();
  }

  // ── Submit: profile ────────────────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await patch(profile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Submit: hours ──────────────────────────────────────────────────────────
  async function saveHours(e: React.FormEvent) {
    e.preventDefault();
    setHoursLoading(true);
    try {
      await patch({ working_hours: formHoursToDb(hours), slot_duration_mins: slotDuration });
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setHoursLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Tabs defaultValue="profile" className="space-y-6">

      {/* Tab bar */}
      <TabsList className="gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 h-auto w-auto">
        {[
          { value: "profile",      label: "Profile",      icon: User  },
          { value: "hours",        label: "Hours",        icon: Clock },
          { value: "voice",        label: "Voice",        icon: Mic   },
          { value: "integrations", label: "Integrations", icon: Plug  },
        ].map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm data-active:bg-white/[0.08] data-active:text-white text-white/40 hover:text-white/70 transition-colors border-0 h-auto"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Profile tab ── */}
      <TabsContent value="profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <SectionCard>
            <div>
              <FieldLabel>Business name</FieldLabel>
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. The Golden Fork"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Business type</FieldLabel>
                <Select
                  value={profile.type}
                  onValueChange={(v) => setProfile((p) => ({ ...p, type: v as Business["type"] }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel>Timezone</FieldLabel>
                <Select
                  value={profile.timezone}
                  onValueChange={(v) => v && setProfile((p) => ({ ...p, timezone: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <FieldLabel>Phone number</FieldLabel>
              <Input
                type="tel"
                value={profile.phone_number}
                onChange={(e) => setProfile((p) => ({ ...p, phone_number: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <FieldLabel>Description <span className="text-white/20">(used in the AI prompt)</span></FieldLabel>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="e.g. A cozy Italian restaurant serving authentic pasta and wood-fired pizza."
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 resize-none"
              />
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <SaveButton loading={profileLoading} saved={profileSaved} />
          </div>
        </form>
      </TabsContent>

      {/* ── Hours tab ── */}
      <TabsContent value="hours">
        <form onSubmit={saveHours} className="space-y-4">
          <SectionCard>
            <div className="space-y-3">
              {DAY_KEYS.map((day) => {
                const d = hours[day];
                return (
                  <div
                    key={day}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                      d.enabled ? "bg-white/[0.04]" : "opacity-50"
                    }`}
                  >
                    {/* Toggle */}
                    <Switch
                      checked={d.enabled}
                      onCheckedChange={(checked) =>
                        setHours((h) => ({ ...h, [day]: { ...h[day], enabled: checked } }))
                      }
                    />

                    {/* Day name */}
                    <span className="w-24 text-sm font-medium text-white/80">
                      {DAY_LABELS[day]}
                    </span>

                    {/* Time inputs */}
                    {d.enabled ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          value={d.open}
                          onChange={(e) =>
                            setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.value } }))
                          }
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white/80 outline-none focus:border-amber-500/50"
                        />
                        <span className="text-white/20 text-xs">to</span>
                        <input
                          type="time"
                          value={d.close}
                          onChange={(e) =>
                            setHours((h) => ({ ...h, [day]: { ...h[day], close: e.target.value } }))
                          }
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white/80 outline-none focus:border-amber-500/50"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-white/25">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Slot duration */}
          <SectionCard>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Slot duration</p>
              <p className="text-xs text-white/35 mb-4">
                How long each reservation slot lasts. Shorter = more bookings per day.
              </p>
              <div className="flex flex-wrap gap-2">
                {[15, 20, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSlotDuration(mins)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                      slotDuration === mins
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                        : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/70"
                    }`}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <SaveButton loading={hoursLoading} saved={hoursSaved} />
          </div>
        </form>
      </TabsContent>

      {/* ── Voice tab ── */}
      <TabsContent value="voice">
        <SectionCard>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">AI Receptionist</p>
            <p className="text-xs text-white/35 mb-5">
              Your Vapi assistant is live and configured. These IDs are read-only.
            </p>

            <div className="space-y-4">
              <CopyField
                label="Vapi Assistant ID"
                value={business.vapi_assistant_id ?? ""}
              />
              <CopyField
                label="AI Phone Number"
                value={business.phone_number ?? ""}
              />
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "oklch(0.60 0.14 60 / 0.20)", background: "oklch(0.60 0.14 60 / 0.06)" }}>
            <span className="h-2 w-2 animate-glow-pulse rounded-full" style={{ background: "#4a9e6b" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#c97d14" }}>AI is online</p>
              <p className="text-xs text-white/30 mt-0.5">
                Powered by GPT-4o mini via Vapi · Answers calls 24/7
              </p>
            </div>
          </div>
        </SectionCard>
      </TabsContent>

      {/* ── Integrations tab ── */}
      <TabsContent value="integrations">
        <div className="space-y-4">
          <GoogleCalendarCard connected={business.google_calendar_connected} />

          {/* Placeholder for future integrations */}
          <div className="rounded-2xl border border-dashed border-white/[0.07] p-6 text-center">
            <p className="text-sm text-white/25">More integrations coming soon</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
