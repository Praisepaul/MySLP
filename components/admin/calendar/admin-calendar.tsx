"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarAppointment { id: string; title: string; patientName: string; status: string; start: string; end: string; timezone: string; meetUrl?: string; }
interface CalendarEvent { id: string; title: string; start: string; end: string; htmlLink?: string; }
interface CalendarData { appointments: CalendarAppointment[]; googleEvents: CalendarEvent[]; connected: boolean; busyIntervals: { start: string; end: string }[]; }

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_MINUTES = 30;
const ROW_HEIGHT = 34;

function dateKey(value: Date, timezone: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(value); }
function localParts(value: Date, timezone: string) { const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value); return { hour: Number(parts.find((p) => p.type === "hour")?.value ?? 0), minute: Number(parts.find((p) => p.type === "minute")?.value ?? 0) }; }
function formatTime(value: string, timezone: string) { return new Intl.DateTimeFormat("en", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value)); }
function formatDay(value: Date, timezone: string) { return new Intl.DateTimeFormat("en", { timeZone: timezone, weekday: "short", day: "numeric", month: "short" }).format(value); }
function weekStart(date: Date) { const copy = new Date(date); const day = copy.getDay(); copy.setDate(copy.getDate() - day); copy.setHours(0, 0, 0, 0); return copy; }
function addDays(date: Date, amount: number) { const copy = new Date(date); copy.setDate(copy.getDate() + amount); return copy; }

export function AdminCalendar({ timezone = "Asia/Kolkata" }: { timezone?: string }) {
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(anchor, index)), [anchor]);
  const range = useMemo(() => ({ from: anchor.toISOString(), to: addDays(anchor, 7).toISOString() }), [anchor]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true); setError("");
      try { const response = await fetch(`/api/admin/calendar?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`, { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Calendar could not be loaded."); if (!cancelled) setData(result as CalendarData); }
      catch (requestError) { if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Calendar could not be loaded."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [range.from, range.to]);

  const appointments = data?.appointments ?? [];
  const googleEvents = data?.googleEvents ?? [];
  const getItemsForDay = (day: Date) => {
    const key = dateKey(day, timezone);
    return { appointments: appointments.filter((item) => dateKey(new Date(item.start), timezone) === key), google: googleEvents.filter((item) => dateKey(new Date(item.start), timezone) === key) };
  };
  const position = (start: string, end: string) => { const a = localParts(new Date(start), timezone); const b = localParts(new Date(end), timezone); const startMinutes = a.hour * 60 + a.minute; const endMinutes = Math.max(startMinutes + 20, b.hour * 60 + b.minute); return { top: Math.max(0, (startMinutes - START_HOUR * 60) / SLOT_MINUTES) * ROW_HEIGHT, height: Math.max(24, (endMinutes - startMinutes) / SLOT_MINUTES * ROW_HEIGHT) }; };

  return <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-lg font-semibold">Schedule</h2><p className="mt-1 text-sm text-muted-foreground">Appointments from Grace Sessions and events from Google Calendar. Times shown in {timezone}.</p></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Previous week"><ChevronLeft /></Button><Button variant="outline" onClick={() => setAnchor(weekStart(new Date()))}>Today</Button><Button variant="outline" size="icon" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Next week"><ChevronRight /></Button></div></div>
    {loading ? <div className="flex min-h-72 items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading calendar" /></div> : error ? <div role="alert" className="m-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</div> : <>
      <div className="hidden overflow-x-auto lg:block"><div className="min-w-[920px]"><div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b"><div className="border-r" />{days.map((day) => <div key={day.toISOString()} className="border-r px-2 py-3 text-center text-xs font-semibold last:border-r-0">{formatDay(day, timezone)}</div>)}</div><div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]"><div className="relative border-r" style={{ height: (END_HOUR - START_HOUR) * 2 * ROW_HEIGHT }}>{Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => <span key={i} className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground" style={{ top: i * 2 * ROW_HEIGHT }}>{String(START_HOUR + i).padStart(2, "0")}:00</span>)}</div>{days.map((day) => { const items = getItemsForDay(day); return <div key={day.toISOString()} className="relative border-r last:border-r-0" style={{ height: (END_HOUR - START_HOUR) * 2 * ROW_HEIGHT }}>{Array.from({ length: (END_HOUR - START_HOUR) * 2 + 1 }, (_, i) => <div key={i} className="absolute inset-x-0 border-t border-dashed border-muted" style={{ top: i * ROW_HEIGHT }} />)}{items.google.map((event) => { const p = position(event.start, event.end); return <a key={`g-${event.id}`} href={event.htmlLink} target="_blank" rel="noreferrer" className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border bg-muted px-2 py-1 text-[11px] leading-4 hover:bg-muted/70" style={{ top: p.top, height: p.height }}><span className="font-medium">{event.title}</span><span className="block opacity-70">Google Calendar · {formatTime(event.start, timezone)}</span></a>; })}{items.appointments.map((event) => { const p = position(event.start, event.end); return <div key={event.id} className="absolute inset-x-1 z-20 overflow-hidden rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] leading-4"><div style={{ top: p.top, height: p.height, position: "absolute", insetInline: 0 }}><span className="font-semibold">{event.title}</span><span className="block">{event.patientName}</span><span className="block text-muted-foreground">{formatTime(event.start, timezone)} · {event.status.replace("_", " ")}</span></div></div>; })}</div>; })}</div></div>
      <div className="divide-y lg:hidden">{days.map((day) => { const items = getItemsForDay(day); if (!items.appointments.length && !items.google.length) return <div key={day.toISOString()} className="px-4 py-4"><p className="text-sm font-semibold">{formatDay(day, timezone)}</p><p className="mt-1 text-sm text-muted-foreground">No scheduled events</p></div>; return <div key={day.toISOString()} className="p-4"><p className="text-sm font-semibold">{formatDay(day, timezone)}</p><div className="mt-3 space-y-2">{items.appointments.map((event) => <div key={event.id} className="rounded-2xl border border-primary/30 bg-primary/5 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">{event.patientName} · {formatTime(event.start, timezone)}–{formatTime(event.end, timezone)}</p></div>{event.meetUrl && <a href={event.meetUrl} className="text-xs font-medium text-primary">Meet</a>}</div></div>)}{items.google.map((event) => <a key={event.id} href={event.htmlLink} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border p-3"><div><p className="font-medium">{event.title}</p><p className="text-sm text-muted-foreground">Google Calendar · {formatTime(event.start, timezone)}–{formatTime(event.end, timezone)}</p></div><ExternalLink className="size-4 shrink-0 text-muted-foreground" /></a>)}</div></div>; })}</div>
    </>}
  </section>;
}
