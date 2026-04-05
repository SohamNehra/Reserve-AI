"use client";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import CallOutcomeBadge from "./CallOutcomeBadge";
import type { Call } from "@/lib/supabase/types";

type TranscriptMessage = { role: "user" | "assistant" | "bot"; message?: string; text?: string };

function formatDuration(secs: number | null): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

type Props = { call: Call | null; onClose: () => void };

export default function TranscriptDrawer({ call, onClose }: Props) {
  if (!call) return null;

  // Transcript can be { text: "..." } or an array of message objects
  let messages: TranscriptMessage[] = [];
  if (call.transcript) {
    const t = call.transcript as { text?: string } | TranscriptMessage[];
    if (Array.isArray(t)) {
      messages = t;
    } else if (t.text) {
      // Plain text — split into lines
      messages = t.text
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const isBot = line.toLowerCase().startsWith("assistant:") || line.toLowerCase().startsWith("bot:");
          const text = line.replace(/^(assistant|bot|user|customer):\s*/i, "");
          return { role: isBot ? "assistant" : "user", text };
        });
    }
  }

  return (
    <Sheet open={!!call} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Call Transcript</SheetTitle>
          <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
            <CallOutcomeBadge outcome={call.outcome} />
            <span>{formatDuration(call.duration_seconds)}</span>
            {call.customer_phone && <span>{call.customer_phone}</span>}
          </div>
        </SheetHeader>

        {messages.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-12">No transcript available</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isBot = msg.role === "assistant" || msg.role === "bot";
              const text = msg.message ?? msg.text ?? "";
              return (
                <div key={i} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isBot
                        ? "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {call.reservation_id && (
          <div className="mt-6 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700">
            Reservation created — ID: {call.reservation_id.slice(0, 8).toUpperCase()}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
