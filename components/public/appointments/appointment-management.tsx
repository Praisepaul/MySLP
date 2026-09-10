"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck2, CheckCircle2, Clock3, Globe2 } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import type { AppointmentPublicView } from "@/lib/appointments/appointment-types";

interface AppointmentManagementProps {
  initialAppointment: AppointmentPublicView;
}

export function AppointmentManagement({ initialAppointment }: AppointmentManagementProps) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: appointment.timezone }).format(start);
  const startTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: appointment.timezone }).format(start);
  const endTime = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: appointment.timezone }).format(end);
  const canCancel = appointment.status === "confirmed";

  async function handleCancel() {
    if (!canCancel || cancelling || start.getTime() <= Date.now()) return;
    const confirmed = window.confirm("Cancel this appointment? This cannot be undone online.");
    if (!confirmed) return;

    setCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointment.confirmationToken}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't cancel the appointment.");
      setAppointment(data.appointment as AppointmentPublicView);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't cancel the appointment. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {appointment.status === "cancelled" ? <CheckCircle2 aria-hidden="true" className="size-6" /> : <CalendarCheck2 aria-hidden="true" className="size-6" />}
          </div>
          <p className="mt-5 text-sm font-medium text-muted-foreground">Appointment management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{appointment.status === "cancelled" ? "Appointment cancelled" : "Your appointment"}</h1>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="bg-muted/40 p-6 sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">Session</p>
            <h2 className="mt-1 text-xl font-semibold">{appointment.service.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{appointment.service.durationMinutes} minute session</p>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex gap-3"><CalendarCheck2 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Date</p><p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p></div></div>
            <div className="flex gap-3"><Clock3 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Time</p><p className="mt-1 text-sm text-muted-foreground">{startTime} – {endTime}</p></div></div>
            <div className="flex gap-3"><Globe2 aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="text-sm font-medium">Timezone</p><p className="mt-1 text-sm text-muted-foreground">{appointment.timezone}</p></div></div>
            <div className="border-t pt-5"><p className="text-sm font-medium">Booked for</p><p className="mt-1 text-sm text-muted-foreground">{appointment.patientName} · {appointment.patientEmail}</p></div>
          </div>
        </div>

        {error && <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        {appointment.status === "confirmed" && (
          <div className="mt-6 rounded-2xl border p-5 sm:p-6">
            <div className="flex gap-3"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><p className="font-medium">Need to cancel?</p><p className="mt-1 text-sm leading-6 text-muted-foreground">You can cancel a future appointment here. Rescheduling will be added in a later phase.</p></div></div>
            <Button className="mt-5" variant="outline" disabled={!canCancel || cancelling} onClick={handleCancel}>{cancelling ? "Cancelling…" : "Cancel appointment"}</Button>
          </div>
        )}

        {appointment.status === "cancelled" && <div className="mt-6 rounded-2xl border border-dashed p-5 text-sm leading-6 text-muted-foreground">This appointment has been cancelled and its scheduling lock has been released.</div>}

        <div className="mt-8 text-center"><Link className={buttonVariants({ variant: "ghost" })} href="/book">Book another appointment</Link></div>
      </div>
    </div>
  );
}
