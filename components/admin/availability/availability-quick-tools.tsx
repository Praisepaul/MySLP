"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Umbrella } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AvailabilityException, AvailabilityRule, DayOfWeek } from "@/lib/config/availability";

const days: { value: DayOfWeek; label: string; jsDay: number }[] = [
  { value: "monday", label: "Mon", jsDay: 1 }, { value: "tuesday", label: "Tue", jsDay: 2 },
  { value: "wednesday", label: "Wed", jsDay: 3 }, { value: "thursday", label: "Thu", jsDay: 4 },
  { value: "friday", label: "Fri", jsDay: 5 }, { value: "saturday", label: "Sat", jsDay: 6 },
  { value: "sunday", label: "Sun", jsDay: 0 },
];
const dayOrder: Record<DayOfWeek, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
const pad = (n: number) => String(n).padStart(2, "0");
function toDateValue(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function parseDate(value: string) { const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); }
function eachDate(from: string, to: string) { const result: string[] = []; const current = parseDate(from); const end = parseDate(to); while (current <= end) { result.push(toDateValue(current)); current.setDate(current.getDate() + 1); } return result; }
function jsDayToDay(value: number): DayOfWeek { return days.find((day) => day.jsDay === value)?.value ?? "sunday"; }
function makeId(prefix: string, date: string, index: number) { return `${prefix}-${date}-${index}`; }

interface Props {
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  busy?: boolean;
  onApply: (exceptions: AvailabilityException[]) => void;
}

export function AvailabilityQuickTools({ rules, exceptions, busy, onApply }: Props) {
  const today = toDateValue(new Date());
  const [mode, setMode] = useState<"block" | "custom" | "copy">("block");
  const [dates, setDates] = useState<string[]>([today]);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const calendarCells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: startOffset + count }, (_, index) => index < startOffset ? null : new Date(month.getFullYear(), month.getMonth(), index - startOffset + 1));
  }, [month]);

  const exceptionMap = useMemo(() => new Map(exceptions.map((item) => [item.date, item])), [exceptions]);

  function toggleDate(date: string) { setDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date].sort()); }
  function toggleDay(day: DayOfWeek) { setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => dayOrder[a] - dayOrder[b])); }

  function applyBlock() {
    if (!dates.length) return;
    const additions = dates.map((date, index) => ({ id: makeId("leave", date, index), date, type: "unavailable" as const, ...(reason.trim() ? { reason: reason.trim() } : {}) }));
    const affected = new Set(dates);
    const next = [...exceptions.filter((item) => !affected.has(item.date)), ...additions].sort((a, b) => a.date.localeCompare(b.date));
    onApply(next);
  }

  function applyRange(type: "custom-hours" | "copy") {
    if (!from || !to || from > to) return;
    const wanted = type === "copy" ? rules.filter((rule) => rule.active) : rules.filter((rule) => rule.active && selectedDays.includes(rule.dayOfWeek)).map((rule) => ({ ...rule, startTime, endTime }));
    if (!wanted.length) return;
    const generated: AvailabilityException[] = [];
    const affected = new Set<string>();
    eachDate(from, to).forEach((date) => {
      const weekday = jsDayToDay(parseDate(date).getDay());
      const matching = wanted.filter((rule) => rule.dayOfWeek === weekday);
      matching.forEach((rule, index) => { affected.add(date); generated.push({ id: makeId(type === "copy" ? "copied" : "range", date, index), date, type: "custom-hours", startTime: rule.startTime, endTime: rule.endTime, ...(reason.trim() ? { reason: reason.trim() } : {}) }); });
    });
    const next = [...exceptions.filter((item) => !affected.has(item.date)), ...generated].sort((a, b) => a.date.localeCompare(b.date));
    onApply(next);
  }

  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(month);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5" />Schedule at a glance</CardTitle><p className="text-sm leading-6 text-muted-foreground">See recurring hours and date-specific changes together. Select a date to add it to a leave list.</p></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 border-b pb-4"><Button type="button" variant="outline" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft className="size-4" /></Button><p className="font-medium">{monthLabel}</p><Button type="button" variant="outline" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight className="size-4" /></Button></div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">{days.map((day) => <div key={day.value} className="py-2">{day.label}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{calendarCells.map((date, index) => date ? (() => { const value = toDateValue(date); const exception = exceptionMap.get(value); const recurring = rules.some((rule) => rule.active && rule.dayOfWeek === jsDayToDay(date.getDay())); const selected = dates.includes(value); return <button key={value} type="button" onClick={() => toggleDate(value)} className={`min-h-16 rounded-xl border p-2 text-left transition hover:bg-muted ${selected ? "ring-2 ring-primary" : ""} ${exception?.type === "unavailable" ? "bg-destructive/5" : exception ? "bg-muted" : recurring ? "bg-background" : "bg-muted/30"}`}><span className="font-medium">{date.getDate()}</span>{exception && <span className="mt-1 block truncate text-[10px] text-muted-foreground">{exception.type === "unavailable" ? "Unavailable" : `${exception.startTime}–${exception.endTime}`}</span>}{!exception && recurring && <span className="mt-1 block text-[10px] text-muted-foreground">Regular hours</span>}</button>; })() : <div key={`empty-${index}`} />)}</div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground"><span>Regular hours</span><span>Date change</span><span>Unavailable</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Umbrella className="size-5" />Quick changes</CardTitle><p className="text-sm leading-6 text-muted-foreground">Handle several dates at once instead of creating them one by one.</p></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 rounded-xl border p-1"><button type="button" onClick={() => setMode("block")} className={`rounded-lg px-2 py-2 text-xs font-medium ${mode === "block" ? "bg-muted" : ""}`}>Leave</button><button type="button" onClick={() => setMode("custom")} className={`rounded-lg px-2 py-2 text-xs font-medium ${mode === "custom" ? "bg-muted" : ""}`}>Date range</button><button type="button" onClick={() => setMode("copy")} className={`rounded-lg px-2 py-2 text-xs font-medium ${mode === "copy" ? "bg-muted" : ""}`}>Copy week</button></div>
          {mode === "block" ? <div className="space-y-4"><div><Label>Dates</Label><div className="mt-2 flex gap-2"><Input type="date" onChange={(e) => e.target.value && !dates.includes(e.target.value) && setDates((current) => [...current, e.target.value].sort())} /><Button type="button" variant="outline" onClick={() => setDates([])}>Clear</Button></div></div><div className="flex flex-wrap gap-2">{dates.map((date) => <button key={date} type="button" onClick={() => toggleDate(date)} className="rounded-full border px-3 py-1.5 text-xs hover:bg-muted">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parseDate(date))} ×</button>)}</div><div><Label htmlFor="quick-leave-reason">Reason (optional)</Label><Input id="quick-leave-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Holiday, leave, conference…" /></div><Button type="button" className="w-full" disabled={busy || !dates.length} onClick={applyBlock}>Block selected dates</Button></div> : <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="quick-from">From</Label><Input id="quick-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div><div><Label htmlFor="quick-to">To</Label><Input id="quick-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div></div>{mode === "custom" && <><div><Label>Days</Label><div className="mt-2 grid grid-cols-4 gap-2">{days.map((day) => <button key={day.value} type="button" aria-pressed={selectedDays.includes(day.value)} onClick={() => toggleDay(day.value)} className={`rounded-lg border px-2 py-2 text-xs ${selectedDays.includes(day.value) ? "border-primary bg-primary/5" : ""}`}>{day.label}</button>)}</div></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="quick-start">Start</Label><Input id="quick-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div><div><Label htmlFor="quick-end">End</Label><Input id="quick-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div></div><div><Label htmlFor="quick-range-reason">Note (optional)</Label><Input id="quick-range-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Summer schedule" /></div><Button type="button" className="w-full" disabled={busy || !from || !to || from > to || !selectedDays.length} onClick={() => applyRange("custom-hours")}>Apply date-range hours</Button></>}{mode === "copy" && <><div className="rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">Copies the active weekly schedule into the selected date range as date-specific hours. Existing date changes in that range are replaced.</div><Button type="button" className="w-full" disabled={busy || !from || !to || from > to} onClick={() => applyRange("copy")}><Copy className="size-4" />Copy weekly schedule to range</Button></>}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
