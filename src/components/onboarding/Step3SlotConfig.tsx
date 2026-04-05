"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { OnboardingData } from "@/types";

const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120];

type Props = {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
};

export default function Step3SlotConfig({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">
        Choose how long each reservation slot lasts. The AI will offer slots
        in this increment throughout your business hours.
      </p>

      <div className="space-y-2">
        <Label htmlFor="slot">Slot duration *</Label>
        <Select
          value={String(data.slot_duration_mins)}
          onValueChange={(v) => onChange({ slot_duration_mins: Number(v) })}
        >
          <SelectTrigger id="slot" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SLOT_OPTIONS.map((mins) => (
              <SelectItem key={mins} value={String(mins)}>
                {mins >= 60
                  ? `${mins / 60} hour${mins > 60 ? "s" : ""}`
                  : `${mins} minutes`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800 mb-1">Example</p>
        <p>
          With {data.slot_duration_mins}-minute slots and hours 9:00–17:00, your AI
          will offer:{" "}
          <span className="font-mono text-xs">
            9:00, 9:{String(data.slot_duration_mins).padStart(2, "0")}
            {data.slot_duration_mins < 60 ? ", …" : ""}
          </span>
        </p>
      </div>
    </div>
  );
}
