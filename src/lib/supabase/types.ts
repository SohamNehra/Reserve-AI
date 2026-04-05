export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkingHours = {
  [day in "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"]?: {
    open: string;
    close: string;
  } | null;
};

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          clerk_user_id: string;
          name: string;
          type: "restaurant" | "clinic" | "salon" | "other";
          description: string | null;
          phone_number: string | null;
          timezone: string;
          vapi_assistant_id: string | null;
          vapi_phone_number_id: string | null;
          slot_duration_mins: number;
          working_hours: WorkingHours;
          google_calendar_connected: boolean;
          google_access_token: string | null;
          google_refresh_token: string | null;
          google_calendar_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          name: string;
          type: "restaurant" | "clinic" | "salon" | "other";
          description?: string | null;
          phone_number?: string | null;
          timezone?: string;
          vapi_assistant_id?: string | null;
          vapi_phone_number_id?: string | null;
          slot_duration_mins?: number;
          working_hours?: Json;
          google_calendar_connected?: boolean;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          google_calendar_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          name?: string;
          type?: "restaurant" | "clinic" | "salon" | "other";
          description?: string | null;
          phone_number?: string | null;
          timezone?: string;
          vapi_assistant_id?: string | null;
          vapi_phone_number_id?: string | null;
          slot_duration_mins?: number;
          working_hours?: Json;
          google_calendar_connected?: boolean;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          google_calendar_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          business_id: string;
          customer_name: string;
          customer_phone: string | null;
          date: string;
          time_slot: string;
          party_size: number | null;
          notes: string | null;
          status: "confirmed" | "cancelled" | "completed";
          created_via: "voice" | "manual";
          vapi_call_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_name: string;
          customer_phone?: string | null;
          date: string;
          time_slot: string;
          party_size?: number | null;
          notes?: string | null;
          status?: "confirmed" | "cancelled" | "completed";
          created_via?: "voice" | "manual";
          vapi_call_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_name?: string;
          customer_phone?: string | null;
          date?: string;
          time_slot?: string;
          party_size?: number | null;
          notes?: string | null;
          status?: "confirmed" | "cancelled" | "completed";
          created_via?: "voice" | "manual";
          vapi_call_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
      calls: {
        Row: {
          id: string;
          business_id: string;
          vapi_call_id: string;
          customer_phone: string | null;
          duration_seconds: number | null;
          transcript: Json | null;
          outcome:
            | "reservation_created"
            | "no_availability"
            | "hung_up"
            | "transferred"
            | null;
          reservation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          vapi_call_id: string;
          customer_phone?: string | null;
          duration_seconds?: number | null;
          transcript?: Json | null;
          outcome?:
            | "reservation_created"
            | "no_availability"
            | "hung_up"
            | "transferred"
            | null;
          reservation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          vapi_call_id?: string;
          customer_phone?: string | null;
          duration_seconds?: number | null;
          transcript?: Json | null;
          outcome?:
            | "reservation_created"
            | "no_availability"
            | "hung_up"
            | "transferred"
            | null;
          reservation_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calls_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calls_reservation_id_fkey";
            columns: ["reservation_id"];
            isOneToOne: false;
            referencedRelation: "reservations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type Call = Database["public"]["Tables"]["calls"]["Row"];
