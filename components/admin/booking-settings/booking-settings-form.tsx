"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditableBookingSettings } from "@/lib/cms/site-settings-repository";

const emptySettings: EditableBookingSettings = {
  enabled: true,
  minimumNoticeMinutes: 24 * 60,
  maximumAdvanceDays: 60,
  slotIntervalMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 10,
  cancellationPolicy: "",
  reschedulingPolicy: "",
  bookingInstructions: "",
};

function minutesToHours(minutes: number) { return minutes / 60; }
function hoursToMinutes(value: string) { return Number(value) * 60; }

export function BookingSettingsForm() {
  const [values, setValues] = useState<EditableBookingSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/booking-settings", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "We couldn't load booking settings.");
        setValues(data.settings as EditableBookingSettings);
      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "We couldn't load booking settings."); }
      finally { setLoading(false); }
    })();
  }, []);

  function update<K extends keyof EditableBookingSettings>(field: K, value: EditableBookingSettings[K]) { setValues((current) => ({ ...current, [field]: value })); setError(""); setNotice(""); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/booking-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save booking settings.");
      setValues(data.settings as EditableBookingSettings); setNotice("Booking settings saved. New availability uses these settings immediately.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "We couldn't save booking settings."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" /></div>;

  return <form onSubmit={save} className="space-y-6">
    <Card><CardHeader><CardTitle>Booking availability</CardTitle></CardHeader><CardContent className="space-y-6">
      <label className="flex items-center justify-between gap-4 rounded-2xl border p-5"><span><span className="block text-sm font-medium">Accept online bookings</span><span className="mt-1 block text-sm text-muted-foreground">Turn this off when you want to temporarily stop new online bookings.</span></span><input type="checkbox" checked={values.enabled} onChange={(e) => update("enabled", e.target.checked)} className="size-5" /></label>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2"><Label htmlFor="minimum-notice">Minimum notice (hours)</Label><Input id="minimum-notice" type="number" min="0" step="1" value={minutesToHours(values.minimumNoticeMinutes)} onChange={(e) => update("minimumNoticeMinutes", hoursToMinutes(e.target.value))} /><p className="text-xs text-muted-foreground">How far ahead a patient must book.</p></div>
        <div className="space-y-2"><Label htmlFor="maximum-advance">Maximum advance (days)</Label><Input id="maximum-advance" type="number" min="0" step="1" value={values.maximumAdvanceDays} onChange={(e) => update("maximumAdvanceDays", Number(e.target.value))} /><p className="text-xs text-muted-foreground">How far into the future patients can book.</p></div>
        <div className="space-y-2"><Label htmlFor="slot-interval">Slot interval (minutes)</Label><Input id="slot-interval" type="number" min="1" step="1" value={values.slotIntervalMinutes} onChange={(e) => update("slotIntervalMinutes", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Spacing between available start times.</p></div>
        <div className="space-y-2"><Label htmlFor="before-buffer">Buffer before (minutes)</Label><Input id="before-buffer" type="number" min="0" step="1" value={values.bufferBeforeMinutes} onChange={(e) => update("bufferBeforeMinutes", Number(e.target.value))} /></div>
        <div className="space-y-2"><Label htmlFor="after-buffer">Buffer after (minutes)</Label><Input id="after-buffer" type="number" min="0" step="1" value={values.bufferAfterMinutes} onChange={(e) => update("bufferAfterMinutes", Number(e.target.value))} /></div>
      </div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Patient-facing information</CardTitle></CardHeader><CardContent className="space-y-6">
      <div className="space-y-2"><Label htmlFor="cancellation-policy">Cancellation policy</Label><Textarea id="cancellation-policy" value={values.cancellationPolicy} onChange={(e) => update("cancellationPolicy", e.target.value)} placeholder="Explain what patients should know about cancelling an appointment." maxLength={5000} /></div>
      <div className="space-y-2"><Label htmlFor="rescheduling-policy">Rescheduling policy</Label><Textarea id="rescheduling-policy" value={values.reschedulingPolicy} onChange={(e) => update("reschedulingPolicy", e.target.value)} placeholder="Explain your rescheduling policy." maxLength={5000} /></div>
      <div className="space-y-2"><Label htmlFor="booking-instructions">Booking instructions</Label><Textarea id="booking-instructions" value={values.bookingInstructions} onChange={(e) => update("bookingInstructions", e.target.value)} placeholder="Anything patients should know before they book." maxLength={5000} /></div>
    </CardContent></Card>
    {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {notice && <div role="status" className="rounded-xl border bg-primary/5 px-4 py-3 text-sm">{notice}</div>}
    <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />} {saving ? "Saving…" : "Save booking settings"}</Button></div>
  </form>;
}
