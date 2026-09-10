"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ExternalLink, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/lib/appointments/appointment-types";

const statuses: Array<AppointmentStatus | "all"> = ["all", "confirmed", "completed", "no_show", "cancelled"];

type AdminAppointment = {
  id?: string;
  confirmationToken: string;
  status: AppointmentStatus;
  service: { name: string; durationMinutes: number };
  patientName: string;
  patientEmail: string;
  startAt: string;
  endAt: string;
  timezone: string;
  googleCalendar?: { eventId?: string; syncStatus: string; lastSyncedAt?: string; lastSyncError?: string };
  googleMeet?: { joinUrl?: string };
};

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(value));
}

function formatDay(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(new Date(value));
}

export function AdminAppointmentsManager() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingToken, setWorkingToken] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/appointments?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't load appointments.");
      setAppointments(data.appointments as AdminAppointment[]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't load appointments.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAppointments(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAppointments]);

  async function updateAppointment(token: string, action: "completed" | "no_show") {
    setWorkingToken(token);
    setError(null);
    try {
      const response = await fetch("/api/admin/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmationToken: token, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't update the appointment.");
      await loadAppointments();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't update the appointment.");
    } finally {
      setWorkingToken(null);
    }
  }

  async function cancelAppointment(token: string) {
    if (!window.confirm("Cancel this appointment? The patient and therapist will receive the calendar cancellation.")) return;
    setWorkingToken(token);
    setError(null);
    try {
      const response = await fetch("/api/admin/appointments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmationToken: token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't cancel the appointment.");
      await loadAppointments();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't cancel the appointment.");
    } finally {
      setWorkingToken(null);
    }
  }

  const grouped = useMemo(() => {
    const groups = new Map<string, AdminAppointment[]>();
    appointments.forEach((appointment) => {
      const key = `${appointment.timezone}:${formatDay(appointment.startAt, appointment.timezone)}`;
      const group = groups.get(key) ?? [];
      group.push(appointment);
      groups.set(key, group);
    });
    return [...groups.values()];
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label htmlFor="appointment-search" className="text-sm font-medium">Search appointments</label>
          <div className="relative mt-2 max-w-xl">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="appointment-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Patient, email, service, or confirmation token" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30" />
          </div>
        </div>
        <div>
          <label htmlFor="appointment-status" className="text-sm font-medium">Status</label>
          <select id="appointment-status" value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus | "all")} className="mt-2 h-10 rounded-lg border border-input bg-background px-3 text-sm">
            {statuses.map((value) => <option key={value} value={value}>{value === "all" ? "All statuses" : value.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed"><Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" /></div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center"><CalendarDays aria-hidden="true" className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No appointments found</h2><p className="mt-1 text-sm text-muted-foreground">Try another status or search term.</p></div>
      ) : (
        grouped.map((group) => {
          const first = group[0];
          return <section key={`${first.timezone}:${formatDay(first.startAt, first.timezone)}`}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{formatDay(first.startAt, first.timezone)} · {first.timezone}</h2>
            <div className="space-y-3">
              {group.map((appointment) => {
                const working = workingToken === appointment.confirmationToken;
                return <article key={appointment.confirmationToken} className="rounded-2xl border bg-background p-5 shadow-xs">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{appointment.patientName}</span><span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{appointment.status.replace("_", " ")}</span></div>
                      <p className="mt-1 text-sm text-muted-foreground">{appointment.patientEmail}</p>
                      <p className="mt-3 text-sm font-medium">{appointment.service.name} · {formatDateTime(appointment.startAt, appointment.timezone)}–{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: appointment.timezone }).format(new Date(appointment.endAt))}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{appointment.timezone} · {appointment.service.durationMinutes} min · Calendar: {appointment.googleCalendar?.syncStatus ?? "unknown"}</p>
                      {appointment.googleCalendar?.lastSyncError && <p className="mt-1 text-xs text-destructive">Calendar sync: {appointment.googleCalendar.lastSyncError}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
                      <a href={`/appointment/${appointment.confirmationToken}`} target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink aria-hidden="true" /> Manage</Button></a>
                      {appointment.googleMeet?.joinUrl && <a href={appointment.googleMeet.joinUrl} target="_blank" rel="noreferrer"><Button variant="outline">Join Meet</Button></a>}
                      {appointment.status === "confirmed" && <>
                        <Button variant="outline" disabled={working} onClick={() => void updateAppointment(appointment.confirmationToken, "completed")}><Check aria-hidden="true" /> Completed</Button>
                        <Button variant="outline" disabled={working} onClick={() => void updateAppointment(appointment.confirmationToken, "no_show")}>No-show</Button>
                        <Button variant="destructive" disabled={working} onClick={() => void cancelAppointment(appointment.confirmationToken)}><X aria-hidden="true" /> Cancel</Button>
                      </>}
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </section>;
        })
      )}
    </div>
  );
}
