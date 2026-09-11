"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarAppointment {
  id: string;
  title: string;
  patientName: string;
  status: string;
  start: string;
  end: string;
  timezone: string;
  meetUrl?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  htmlLink?: string;
}

interface CalendarData {
  appointments: CalendarAppointment[];
  googleEvents: CalendarEvent[];
  connected: boolean;
  busyIntervals: { start: string; end: string }[];
}

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_MINUTES = 30;
const ROW_HEIGHT = 24;
const COMPRESSED_GAP_ROWS = 1;
const MIN_EVENT_BUFFER_MINUTES = 30;
const EMPTY_APPOINTMENTS: CalendarAppointment[] = [];
const EMPTY_GOOGLE_EVENTS: CalendarEvent[] = [];

function dateKey(value: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function localParts(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

function minutesFor(value: string, timezone: string) {
  const parts = localParts(new Date(value), timezone);
  return parts.hour * 60 + parts.minute;
}

function formatTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function formatDay(value: Date, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(value);
}

function weekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

type TimelineSegment = {
  start: number;
  end: number;
  compressedBefore: boolean;
};

function buildTimelineSegments(
  appointments: CalendarAppointment[],
  googleEvents: CalendarEvent[],
  timezone: string,
): TimelineSegment[] {
  const occupied = [...appointments, ...googleEvents]
    .map((item) => ({
      start: Math.max(START_HOUR * 60, minutesFor(item.start, timezone) - MIN_EVENT_BUFFER_MINUTES),
      end: Math.min(END_HOUR * 60, minutesFor(item.end, timezone) + MIN_EVENT_BUFFER_MINUTES),
    }))
    .filter((item) => item.end > item.start)
    .sort((a, b) => a.start - b.start);

  if (!occupied.length) return [];

  const merged: { start: number; end: number }[] = [];
  for (const interval of occupied) {
    const previous = merged[merged.length - 1];
    if (!previous || interval.start > previous.end) {
      merged.push({ ...interval });
    } else {
      previous.end = Math.max(previous.end, interval.end);
    }
  }

  return merged.map((interval, index) => ({
    ...interval,
    compressedBefore: index > 0,
  }));
}

export function AdminCalendar({ timezone = "Asia/Kolkata" }: { timezone?: string }) {
  const [anchor, setAnchor] = useState(() => weekStart(new Date()));
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(anchor, index)),
    [anchor],
  );
  const range = useMemo(
    () => ({ from: anchor.toISOString(), to: addDays(anchor, 7).toISOString() }),
    [anchor],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/admin/calendar?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
          { cache: "no-store" },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Calendar could not be loaded.");
        if (!cancelled) setData(result as CalendarData);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Calendar could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const appointments = data?.appointments ?? EMPTY_APPOINTMENTS;
  const googleEvents = data?.googleEvents ?? EMPTY_GOOGLE_EVENTS;

  const timeline = useMemo(
    () => buildTimelineSegments(appointments, googleEvents, timezone),
    [appointments, googleEvents, timezone],
  );

  const timelineHeight = timeline.length
    ? timeline.reduce((height, segment) => {
        const rows = Math.max(1, Math.ceil((segment.end - segment.start) / SLOT_MINUTES));
        return height + rows * ROW_HEIGHT + (segment.compressedBefore ? COMPRESSED_GAP_ROWS * ROW_HEIGHT : 0);
      }, 0)
    : 0;

  const getItemsForDay = (day: Date) => {
    const key = dateKey(day, timezone);
    return {
      appointments: appointments.filter(
        (item) => dateKey(new Date(item.start), timezone) === key,
      ),
      google: googleEvents.filter(
        (item) => dateKey(new Date(item.start), timezone) === key,
      ),
    };
  };

  const position = (start: string, end: string) => {
    const startMinutes = minutesFor(start, timezone);
    const endMinutes = Math.max(startMinutes + 20, minutesFor(end, timezone));
    let top = 0;

    for (const segment of timeline) {
      if (startMinutes < segment.start) break;

      if (segment.compressedBefore) top += COMPRESSED_GAP_ROWS * ROW_HEIGHT;

      if (startMinutes >= segment.end) {
        top += Math.max(1, Math.ceil((segment.end - segment.start) / SLOT_MINUTES)) * ROW_HEIGHT;
      } else {
        top += Math.max(0, (startMinutes - segment.start) / SLOT_MINUTES) * ROW_HEIGHT;
        break;
      }
    }

    return {
      top,
      height: Math.max(22, ((endMinutes - startMinutes) / SLOT_MINUTES) * ROW_HEIGHT),
    };
  };

  const segmentOffset = (segment: TimelineSegment) => {
    let top = 0;
    for (const current of timeline) {
      if (current === segment) return top;
      if (current.compressedBefore) top += COMPRESSED_GAP_ROWS * ROW_HEIGHT;
      top += Math.max(1, Math.ceil((current.end - current.start) / SLOT_MINUTES)) * ROW_HEIGHT;
    }
    return top;
  };

  return (
    <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        <div>
          <h2 className="text-lg font-semibold">Schedule</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Grace Sessions appointments and Google Calendar events · {timezone}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setAnchor(addDays(anchor, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setAnchor(weekStart(new Date()))}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setAnchor(addDays(anchor, 7))}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading calendar" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="m-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b">
                <div className="border-r" />
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="border-r px-1.5 py-2 text-center text-[11px] font-semibold last:border-r-0"
                  >
                    {formatDay(day, timezone)}
                  </div>
                ))}
              </div>

              {timeline.length ? (
                <div className="max-h-[min(68vh,620px)] overflow-y-auto">
                  <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))]">
                    <div className="relative border-r" style={{ height: timelineHeight }}>
                      {timeline.map((segment) => {
                        const offset = segmentOffset(segment);
                        return (
                          <div key={`${segment.start}-${segment.end}`}>
                            <span
                              className="absolute right-1.5 -translate-y-1/2 text-[9px] tabular-nums text-muted-foreground"
                              style={{ top: offset }}
                            >
                              {String(Math.floor(segment.start / 60)).padStart(2, "0")}:{String(segment.start % 60).padStart(2, "0")}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {days.map((day) => {
                      const items = getItemsForDay(day);

                      return (
                        <div
                          key={day.toISOString()}
                          className="relative border-r last:border-r-0"
                          style={{ height: timelineHeight }}
                        >
                          {timeline.map((segment) => {
                            const offset = segmentOffset(segment);
                            const rows = Math.max(1, Math.ceil((segment.end - segment.start) / SLOT_MINUTES));
                            return (
                              <div
                                key={`${segment.start}-${segment.end}`}
                                className="absolute inset-x-0 border-t border-dashed border-muted"
                                style={{ top: offset, height: rows * ROW_HEIGHT }}
                              />
                            );
                          })}

                          {items.google.map((event) => {
                            const p = position(event.start, event.end);
                            return (
                              <a
                                key={`g-${event.id}`}
                                href={event.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-x-0.5 z-10 overflow-hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] leading-3.5 hover:bg-muted/70"
                                style={{ top: p.top, height: p.height }}
                              >
                                <span className="font-medium">{event.title}</span>
                                <span className="block truncate opacity-70">
                                  Google · {formatTime(event.start, timezone)}
                                </span>
                              </a>
                            );
                          })}

                          {items.appointments.map((event) => {
                            const p = position(event.start, event.end);
                            return (
                              <div
                                key={event.id}
                                className="absolute inset-x-0.5 z-20 overflow-hidden rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] leading-3.5"
                                style={{ top: p.top, height: p.height }}
                              >
                                <span className="font-semibold">{event.title}</span>
                                <span className="block truncate">{event.patientName}</span>
                                <span className="block truncate text-muted-foreground">
                                  {formatTime(event.start, timezone)} · {event.status.replace("_", " ")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No scheduled events this week.
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <div className="max-h-[70vh] overflow-y-auto divide-y">
              {days.map((day) => {
                const items = getItemsForDay(day);

                if (!items.appointments.length && !items.google.length) {
                  return (
                    <div key={day.toISOString()} className="px-4 py-3">
                      <p className="text-sm font-semibold">{formatDay(day, timezone)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">No scheduled events</p>
                    </div>
                  );
                }

                return (
                  <div key={day.toISOString()} className="p-3">
                    <p className="text-sm font-semibold">{formatDay(day, timezone)}</p>
                    <div className="mt-2 space-y-1.5">
                      {items.appointments.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-primary/30 bg-primary/5 p-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{event.title}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {event.patientName} · {formatTime(event.start, timezone)}–
                                {formatTime(event.end, timezone)}
                              </p>
                            </div>
                            {event.meetUrl && (
                              <a href={event.meetUrl} className="shrink-0 text-xs font-medium text-primary">
                                Meet
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {items.google.map((event) => (
                        <a
                          key={event.id}
                          href={event.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-2 rounded-xl border p-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{event.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              Google Calendar · {formatTime(event.start, timezone)}–
                              {formatTime(event.end, timezone)}
                            </p>
                          </div>
                          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
