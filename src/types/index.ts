export type BusinessType = "restaurant" | "clinic" | "salon" | "other";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayConfig = {
  enabled: boolean;
  open: string;   // "HH:MM"
  close: string;  // "HH:MM"
};

export type WorkingHoursForm = Record<DayKey, DayConfig>;

export type OnboardingData = {
  name: string;
  type: BusinessType;
  phone_number: string;
  timezone: string;
  description: string;
  slot_duration_mins: number;
  working_hours: WorkingHoursForm;
};

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DEFAULT_WORKING_HOURS: WorkingHoursForm = {
  mon: { enabled: true,  open: "09:00", close: "17:00" },
  tue: { enabled: true,  open: "09:00", close: "17:00" },
  wed: { enabled: true,  open: "09:00", close: "17:00" },
  thu: { enabled: true,  open: "09:00", close: "17:00" },
  fri: { enabled: true,  open: "09:00", close: "17:00" },
  sat: { enabled: false, open: "10:00", close: "16:00" },
  sun: { enabled: false, open: "10:00", close: "16:00" },
};
