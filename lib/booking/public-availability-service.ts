import { findActiveAppointmentsOverlapping } from "@/lib/appointments/appointment-repository";
import { getBookableSlotsWithConfiguration } from "@/lib/booking/booking-engine";
import { getCachedGoogleCalendarBusyIntervals } from "@/lib/calendar/google-calendar-service";
import { services } from "@/lib/config/services";
import { availabilityExceptions, availabilityRules } from "@/lib/config/availability";
import { getBookingSettings } from "@/lib/cms/site-settings-repository";
import type { BookableSlot, BookingConflict } from "@/lib/booking/slot-types";

const availabilityLookaheadDays = 14;
const dayMilliseconds = 24 * 60 * 60 * 1000;
type PublicAvailabilityRequest = { serviceId: unknown; timezone: unknown; dates: unknown };
export type PublicAvailabilityResult = { dates: string[]; slotsByDate: Record<string, BookableSlot[]> };

function assertTimezone(timezone: string) { try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(); } catch { throw new Error("Please choose a valid timezone."); } }
function parseDateBoundary(date: string): Date { if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid availability date."); const [year, month, day] = date.split("-").map(Number); const boundary = new Date(Date.UTC(year, month - 1, day)); if (boundary.toISOString().slice(0, 10) !== date) throw new Error("Invalid availability date."); return boundary; }
function validateRequest(input: PublicAvailabilityRequest): { serviceId: string; timezone: string; dates: string[] } { if (typeof input.serviceId !== "string" || input.serviceId.length > 100) throw new Error("Please choose a valid service."); if (typeof input.timezone !== "string" || input.timezone.length > 100) throw new Error("Please choose a valid timezone."); assertTimezone(input.timezone); if (!Array.isArray(input.dates) || input.dates.length < 1 || input.dates.length > availabilityLookaheadDays) throw new Error("Please choose a valid availability range."); const dates = input.dates.filter((date): date is string => typeof date === "string"); if (dates.length !== input.dates.length || new Set(dates).size !== dates.length) throw new Error("Please choose a valid availability range."); dates.forEach(parseDateBoundary); return { serviceId: input.serviceId, timezone: input.timezone, dates }; }

export async function getPublicBookableSlots(input: PublicAvailabilityRequest): Promise<PublicAvailabilityResult> {
  const { serviceId, timezone, dates } = validateRequest(input);
  const service = services.find((item) => item.id === serviceId && item.active);
  if (!service) throw new Error("That service is no longer available.");
  const boundaries = dates.map(parseDateBoundary);
  const rangeStart = new Date(Math.min(...boundaries.map((date) => date.getTime())) - dayMilliseconds);
  const rangeEnd = new Date(Math.max(...boundaries.map((date) => date.getTime())) + 2 * dayMilliseconds);
  const [appointments, calendarBusy, settings] = await Promise.all([findActiveAppointmentsOverlapping(rangeStart, rangeEnd), getCachedGoogleCalendarBusyIntervals(rangeStart, rangeEnd), getBookingSettings()]);
  const appointmentConflicts: BookingConflict[] = appointments.map((appointment) => ({ start: appointment.startAt, end: appointment.endAt, source: "appointment" }));
  const calendarConflicts: BookingConflict[] = (calendarBusy ?? []).map((interval) => ({ start: interval.start, end: interval.end, source: "calendar" }));
  const conflicts = [...appointmentConflicts, ...calendarConflicts];
  const configuration = { settings, availabilityRules, availabilityExceptions };
  const slotsByDate = Object.fromEntries(dates.map((date) => [date, getBookableSlotsWithConfiguration({ date, service, timezone, conflicts, now: new Date() }, configuration).slots]));
  return { dates, slotsByDate };
}

export const publicAvailabilityLookaheadDays = availabilityLookaheadDays;
