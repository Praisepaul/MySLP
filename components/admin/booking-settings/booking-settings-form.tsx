"use client";

import { useEffect, useState } from "react";
import { Check, Info, Loader2 } from "lucide-react";
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
  cancellationAllowed: true,
  cancellationDeadlineMinutes: 24 * 60,
  reschedulingAllowed: true,
  reschedulingDeadlineMinutes: 24 * 60,
  cancellationPolicy: "",
  reschedulingPolicy: "",
  bookingInstructions: "",
};

function minutesToHours(minutes: number) { return minutes / 60; }
function hoursToMinutes(value: string) { return Number(value) * 60; }

type HelpTipProps = { title: string; text: string; example: string; open: boolean; onToggle: () => void };

function HelpTip({ title, text, example, open, onToggle }: HelpTipProps) {
  return <span className="relative inline-flex align-middle">
    <button type="button" onClick={onToggle} aria-expanded={open} aria-label={`Help for ${title}`} className="ml-1 inline-flex size-5 items-center justify-center rounded-full border text-muted-foreground transition hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Info className="size-3" aria-hidden="true" />
    </button>
    {open && <span role="note" className="absolute left-0 top-7 z-20 w-64 rounded-xl border bg-background p-3 text-xs font-normal leading-5 text-foreground shadow-lg sm:w-72">
      <span className="block font-medium">{text}</span>
      <span className="mt-1 block text-muted-foreground"><strong>Example:</strong> {example}</span>
    </span>}
  </span>;
}

export function BookingSettingsForm() {
  const [values, setValues] = useState<EditableBookingSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openHelp, setOpenHelp] = useState("");

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
  function toggleHelp(id: string) { setOpenHelp((current) => current === id ? "" : id); }

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
        <div className="space-y-2"><Label htmlFor="minimum-notice">Minimum notice <HelpTip title="Minimum notice" text="How far ahead a patient must book." example="24 hours means tomorrow is the earliest they can book." open={openHelp === "minimum-notice"} onToggle={() => toggleHelp("minimum-notice")} /></Label><Input id="minimum-notice" type="number" min="0" step="1" value={minutesToHours(values.minimumNoticeMinutes)} onChange={(e) => update("minimumNoticeMinutes", hoursToMinutes(e.target.value))} /><p className="text-xs text-muted-foreground">Hours</p></div>
        <div className="space-y-2"><Label htmlFor="maximum-advance">Maximum booking window <HelpTip title="Maximum booking window" text="How far into the future patients can book." example="60 days means they cannot book more than 60 days ahead." open={openHelp === "maximum-advance"} onToggle={() => toggleHelp("maximum-advance")} /></Label><Input id="maximum-advance" type="number" min="0" step="1" value={values.maximumAdvanceDays} onChange={(e) => update("maximumAdvanceDays", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Days</p></div>
        <div className="space-y-2"><Label htmlFor="slot-interval">Appointment start times <HelpTip title="Appointment start times" text="The spacing between possible appointment start times." example="30 minutes gives 09:00, 09:30, 10:00, and so on." open={openHelp === "slot-interval"} onToggle={() => toggleHelp("slot-interval")} /></Label><Input id="slot-interval" type="number" min="1" step="1" value={values.slotIntervalMinutes} onChange={(e) => update("slotIntervalMinutes", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Minutes</p></div>
        <div className="space-y-2"><Label htmlFor="before-buffer">Time needed before a session <HelpTip title="Time needed before a session" text="Extra time kept clear before a session." example="10 minutes means a session cannot be placed right up against the previous appointment." open={openHelp === "before-buffer"} onToggle={() => toggleHelp("before-buffer")} /></Label><Input id="before-buffer" type="number" min="0" step="1" value={values.bufferBeforeMinutes} onChange={(e) => update("bufferBeforeMinutes", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Minutes</p></div>
        <div className="space-y-2"><Label htmlFor="after-buffer">Time needed after a session <HelpTip title="Time needed after a session" text="Extra time kept clear after a session." example="10 minutes means a 10:00–11:00 session makes 11:10 the next possible start." open={openHelp === "after-buffer"} onToggle={() => toggleHelp("after-buffer")} /></Label><Input id="after-buffer" type="number" min="0" step="1" value={values.bufferAfterMinutes} onChange={(e) => update("bufferAfterMinutes", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Minutes</p></div>
      </div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Changes to appointments</CardTitle></CardHeader><CardContent className="space-y-6">
      <label className="flex items-center justify-between gap-4 rounded-2xl border p-5"><span><span className="block text-sm font-medium">Allow patients to cancel online <HelpTip title="Allow patients to cancel online" text="Lets patients cancel their own appointment from their appointment page." example="Off means they need to contact you to cancel." open={openHelp === "cancel-allowed"} onToggle={() => toggleHelp("cancel-allowed")} /></span></span><input type="checkbox" checked={values.cancellationAllowed} onChange={(e) => update("cancellationAllowed", e.target.checked)} className="size-5" /></label>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="cancellation-deadline">Cancellation deadline <HelpTip title="Cancellation deadline" text="How much notice a patient needs to cancel online." example="24 hours means a Monday 10:00 session must be cancelled by Sunday 10:00." open={openHelp === "cancellation-deadline"} onToggle={() => toggleHelp("cancellation-deadline")} /></Label><Input id="cancellation-deadline" type="number" min="0" step="1" value={minutesToHours(values.cancellationDeadlineMinutes)} onChange={(e) => update("cancellationDeadlineMinutes", hoursToMinutes(e.target.value))} disabled={!values.cancellationAllowed} /><p className="text-xs text-muted-foreground">Hours before the session</p></div>
        <div className="space-y-2"><Label htmlFor="rescheduling-deadline">Rescheduling deadline <HelpTip title="Rescheduling deadline" text="How much notice a patient needs to change their appointment online." example="24 hours means changes are not allowed within 24 hours of the session." open={openHelp === "rescheduling-deadline"} onToggle={() => toggleHelp("rescheduling-deadline")} /></Label><Input id="rescheduling-deadline" type="number" min="0" step="1" value={minutesToHours(values.reschedulingDeadlineMinutes)} onChange={(e) => update("reschedulingDeadlineMinutes", hoursToMinutes(e.target.value))} disabled={!values.reschedulingAllowed} /><p className="text-xs text-muted-foreground">Hours before the session</p></div>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-2xl border p-5"><span><span className="block text-sm font-medium">Allow patients to reschedule online <HelpTip title="Allow patients to reschedule online" text="Lets patients choose another available time from their appointment page." example="Off means you handle appointment changes yourself." open={openHelp === "reschedule-allowed"} onToggle={() => toggleHelp("reschedule-allowed")} /></span></span><input type="checkbox" checked={values.reschedulingAllowed} onChange={(e) => update("reschedulingAllowed", e.target.checked)} className="size-5" /></label>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Patient-facing information</CardTitle></CardHeader><CardContent className="space-y-6">
      <div className="space-y-2"><Label htmlFor="cancellation-policy">Cancellation policy <HelpTip title="Cancellation policy" text="Optional wording that explains your cancellation expectations to patients." example="Please give at least 24 hours' notice when cancelling." open={openHelp === "cancellation-policy"} onToggle={() => toggleHelp("cancellation-policy")} /></Label><Textarea id="cancellation-policy" value={values.cancellationPolicy} onChange={(e) => update("cancellationPolicy", e.target.value)} placeholder="Explain what patients should know about cancelling an appointment." maxLength={5000} /></div>
      <div className="space-y-2"><Label htmlFor="rescheduling-policy">Rescheduling policy <HelpTip title="Rescheduling policy" text="Optional wording that explains your rescheduling expectations to patients." example="You can reschedule online up to 24 hours before your session." open={openHelp === "rescheduling-policy"} onToggle={() => toggleHelp("rescheduling-policy")} /></Label><Textarea id="rescheduling-policy" value={values.reschedulingPolicy} onChange={(e) => update("reschedulingPolicy", e.target.value)} placeholder="Explain your rescheduling policy." maxLength={5000} /></div>
      <div className="space-y-2"><Label htmlFor="booking-instructions">Booking instructions <HelpTip title="Booking instructions" text="A short message with anything patients should know before booking." example="For your first visit, please have your referral details ready." open={openHelp === "booking-instructions"} onToggle={() => toggleHelp("booking-instructions")} /></Label><Textarea id="booking-instructions" value={values.bookingInstructions} onChange={(e) => update("bookingInstructions", e.target.value)} placeholder="Anything patients should know before they book." maxLength={5000} /></div>
    </CardContent></Card>
    {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {notice && <div role="status" className="rounded-xl border bg-primary/5 px-4 py-3 text-sm">{notice}</div>}
    <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />} {saving ? "Saving…" : "Save booking settings"}</Button></div>
  </form>;
}
