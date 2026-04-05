"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingData, BusinessType } from "@/types";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type Props = {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
};

export default function Step1BusinessInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Business name *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. The Golden Fork"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Business type *</Label>
        <Select
          value={data.type}
          onValueChange={(v) => onChange({ type: v as BusinessType })}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="salon">Salon</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Business phone number</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone_number}
          onChange={(e) => onChange({ phone_number: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone *</Label>
        <Select
          value={data.timezone}
          onValueChange={(v) => onChange({ timezone: v ?? undefined })}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Business description{" "}
          <span className="text-zinc-400 text-xs">(used in the AI prompt)</span>
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="e.g. A cozy Italian restaurant in downtown serving authentic pasta and wood-fired pizza."
          rows={3}
        />
      </div>
    </div>
  );
}
