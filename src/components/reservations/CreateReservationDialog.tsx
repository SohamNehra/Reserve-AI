"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = { open: boolean; onClose: () => void };

export default function CreateReservationDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    date: "",
    time_slot: "",
    party_size: "",
    notes: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          party_size: form.party_size ? Number(form.party_size) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
      onClose();
      setForm({ customer_name: "", customer_phone: "", date: "", time_slot: "", party_size: "", notes: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Customer name *</Label>
              <Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Phone number</Label>
              <Input type="tel" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Time *</Label>
              <Input type="time" value={form.time_slot} onChange={(e) => set("time_slot", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Party size</Label>
              <Input type="number" min="1" value={form.party_size} onChange={(e) => set("party_size", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
