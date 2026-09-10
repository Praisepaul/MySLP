"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { BookingDateTimePicker } from "@/components/public/booking/booking-date-time-picker";
import { Button } from "@/components/ui/button";
import type { AppointmentPublicView } from "@/lib/appointments/appointment-types";
import type { BookableSlot } from "@/lib/booking/slot-types";
import type { Service } from "@/lib/config/services";

interface AppointmentRescheduleProps {
  appointment: AppointmentPublicView;
  service: Service;
}

function getDateStrings(timezone: string) {
  const dates: string[] = [];
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const today = new Date();
  for (let index = 0; index < 14; index += 1) {
    const date = new Date(today.getTime() + index * 24 * 60 * 60 * 1000);
    dates.push(formatter.format(date));
  }
  return dates;
}

export function AppointmentReschedule({ appointment, service }: AppointmentRescheduleProps) {
  const [timezone, setTimezone] = useState(appointment.timezone);
  const [dates, setDates] = useState<string[]>([]);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, BookableSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<AppointmentPublicView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => getDateStrings(timezone), [timezone]);

  async function loadAvailability() {
    setLoading(true);
    setError(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    try {
      const response = await fetch("/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: service.id, timezone, dates: dateRange }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't check availability.");
      setDates(data.dates);
      setSlotsByDate(Object.fromEntries(Object.entries(data.slotsByDate).map(([date, slots]) => [date, (slots as Array<{ start: string; end: string }>).map((slot) => ({ ...slot, start: new Date(slot.start), end: new Date(slot.end) }))])));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't check availability. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAvailability(); }, [timezone]);

  async function handleReschedule() {
    if (!selectedSlot || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointment.confirmationToken}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startAt: selectedSlot.start.toISOString() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't reschedule the appointment.");
      setDone(data.appointment as AppointmentPublicView);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't reschedule the appointment. Please try again.");
      await loadAvailability();
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: done.timezone }).format(new Date(done.startAt));
    const timeLabel = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: done.timezone }).format(new Date(done.startAt));
    return <div className="mx-auto max-w-2xl py-16 text-center sm:py-24"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CheckCircle2 aria-hidden="true" className="size-7" /></div><h1 className="mt-6 text-3xl font-semibold tracking-tight">Appointment rescheduled</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Your new time is {dateLabel} at {timeLabel}. Calendar guests will receive the updated event notification.</p>{done.googleMeet?.joinUrl && <a className="mt-6 inline-flex rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted" href={done.googleMeet.joinUrl} target="_blank" rel="noreferrer">Join Google Meet</a>}</div>;
  }

  return <div className="bg-muted/20 py-12 sm:py-20"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><div className="mb-8 rounded-2xl border bg-background p-5"><div className="flex items-center gap-3"><CalendarDays aria-hidden="true" className="size-5 text-primary" /><div><p className="font-medium">Reschedule {appointment.service.name}</p><p className="mt-1 text-sm text-muted-foreground">Choose a new time. Your current appointment remains unchanged until you confirm.</p></div></div></div>{error && <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}<BookingDateTimePicker service={service} dates={dates} selectedDate={selectedDate} selectedSlot={selectedSlot} slotsByDate={slotsByDate} timezone={timezone} loading={loading} onDateSelect={setSelectedDate} onSlotSelect={setSelectedSlot} onTimezoneChange={setTimezone} onBack={() => window.history.back()} onContinue={() => void handleReschedule()} />{saving && <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Updating your appointment…</div>}<div className="mt-4 text-center text-xs text-muted-foreground">The selected time is checked again on the server before the change is saved.</div></div></div>;
}
