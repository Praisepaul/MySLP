"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck2, CheckCircle2, Clock3, Globe2, RefreshCw, Video } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { CalendarActions } from "@/components/public/calendar/calendar-actions";
import type { AppointmentPublicView } from "@/lib/appointments/appointment-types";
import { useDataSync } from "@/lib/ui/use-data-sync";

interface AppointmentManagementProps { initialAppointment: AppointmentPublicView; }

export function AppointmentManagement({ initialAppointment }: AppointmentManagementProps) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [renderedAt] = useState(() => Date.now());
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: appointment.timezone }).format(start);
  const startTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: appointment.timezone }).format(start);
  const endTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: appointment.timezone }).format(end);
  const canCancel = appointment.status === "confirmed" && start.getTime() > renderedAt;

  const loadAppointment = useCallback(async () => {
    try {
      const response = await fetch(`/api/appointments/${appointment.confirmationToken}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't refresh the appointment.");
      setAppointment(data.appointment as AppointmentPublicView);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't refresh the appointment.");
    }
  }, [appointment.confirmationToken]);

  const { refresh, refreshing } = useDataSync({ revisionUrl: "/api/appointments/revision", onRefresh: loadAppointment });

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAppointment(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointment]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleCancel() {
    if (!canCancel || cancelling) return;
    const confirmed = window.confirm("Cancel this appointment? This cannot be undone online.");
    if (!confirmed) return;
    setCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointment.confirmationToken}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't cancel the appointment.");
      setAppointment(data.appointment as AppointmentPublicView);
      setNotice("Your appointment has been cancelled.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't cancel the appointment. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="bg-muted/20 py-10 sm:py-16 lg:py-24"><div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{appointment.status === "cancelled" ? <CheckCircle2 aria-hidden="true" className="size-6" /> : <CalendarCheck2 aria-hidden="true" className="size-6" />}</div><p className="mt-5 text-sm font-medium text-muted-foreground">Appointment management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{appointment.status === "cancelled" ? "Appointment cancelled" : "Your appointment"}</h1></div>

      {appointment.status === "confirmed" && appointment.googleMeet?.joinUrl && <div className="mt-6"><a href={appointment.googleMeet.joinUrl} target="_blank" rel="noreferrer" className={`${buttonVariants({ variant: "default" })} h-12 w-full justify-center text-base font-semibold shadow-sm`}><Video aria-hidden="true" /> Join Google Meet</a><p className="mt-2 text-center text-xs text-muted-foreground">Your online session link</p></div>}

      <div className="mt-6 overflow-hidden rounded-3xl border bg-background shadow-sm sm:mt-8"><div className="bg-muted/40 p-6 sm:p-8"><p className="text-sm font-medium text-muted-foreground">Session</p><h2 className="mt-1 text-xl font-semibold">{appointment.service.name}</h2><p className="mt-1 text-sm text-muted-foreground">{appointment.service.durationMinutes} minute session</p></div><div className="space-y-5 p-6 sm:p-8"><div className="flex gap-3"><CalendarCheck2 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Date</p><p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p></div></div><div className="flex gap-3"><Clock3 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Time</p><p className="mt-1 text-sm text-muted-foreground">{startTime} – {endTime}</p></div></div><div className="flex gap-3"><Globe2 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Timezone</p><p className="mt-1 text-sm text-muted-foreground">{appointment.timezone}</p></div></div><div className="border-t pt-5"><p className="text-sm font-medium">Booked for</p><p className="mt-1 break-words text-sm text-muted-foreground">{appointment.patientName} · {appointment.patientEmail}</p></div></div></div>

      {appointment.status === "confirmed" && <div className="mt-6"><CalendarActions appointment={appointment} /></div>}
      {error && <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      {notice && <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-xl border bg-background px-4 py-3 text-sm font-medium shadow-lg">{notice}</div>}
      {appointment.status === "confirmed" && <div className="mt-6 rounded-2xl border p-5 sm:p-6"><div className="flex gap-3"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="font-medium">Need to change the appointment?</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Choose another available time or cancel your future appointment.</p></div></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link className={buttonVariants({ variant: "outline" }) + " min-h-11 w-full sm:w-auto"} href={`/appointment/${appointment.confirmationToken}/reschedule`}>Reschedule appointment</Link><Button variant="outline" className="min-h-11 w-full sm:w-auto" disabled={!canCancel || cancelling} onClick={handleCancel}>{cancelling ? "Cancelling…" : "Cancel appointment"}</Button></div></div>}
      {appointment.status === "cancelled" && <div className="mt-6 rounded-2xl border border-dashed p-5 text-sm leading-6 text-muted-foreground">This appointment has been cancelled and its scheduling lock has been released.</div>}
      <div className="mt-6 flex flex-col items-center gap-2 text-center sm:mt-8"><Button variant="ghost" className="min-h-11" onClick={() => void refresh()} disabled={refreshing}><RefreshCw aria-hidden="true" className={refreshing ? "animate-spin" : ""} /> Refresh appointment</Button><Link className={buttonVariants({ variant: "ghost" })} href="/book">Book another appointment</Link></div>
    </div></div>
  );
}
