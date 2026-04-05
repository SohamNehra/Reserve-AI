"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { OnboardingData, DayKey } from "@/types";
import { DAY_LABELS } from "@/types";

type Props = {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
};

const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function Step2WorkingHours({ data, onChange }: Props) {
  function updateDay(day: DayKey, patch: Partial<OnboardingData["working_hours"][DayKey]>) {
    onChange({
      working_hours: {
        ...data.working_hours,
        [day]: { ...data.working_hours[day], ...patch },
      },
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Set your opening and closing times. Closed days will not accept reservations.
      </p>
      {DAYS.map((day) => {
        const cfg = data.working_hours[day];
        return (
          <div key={day} className="flex items-center gap-4">
            <Switch
              checked={cfg.enabled}
              onCheckedChange={(checked) => updateDay(day, { enabled: checked })}
            />
            <span className="w-24 text-sm font-medium">{DAY_LABELS[day]}</span>
            {cfg.enabled ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={cfg.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className="w-32"
                />
                <span className="text-zinc-400 text-sm">to</span>
                <Input
                  type="time"
                  value={cfg.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className="w-32"
                />
              </div>
            ) : (
              <span className="text-sm text-zinc-400">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
