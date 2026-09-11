import type { BookingConstraints } from "@/lib/booking/slot-types";

export type BookingSettings = BookingConstraints & {
  enabled: boolean;
  cancellationAllowed: boolean;
  cancellationDeadlineMinutes: number;
  reschedulingAllowed: boolean;
  reschedulingDeadlineMinutes: number;
};

export const bookingSettings: BookingSettings = {
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
};

function isNonNegativeFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateBookingSettings(settings: BookingSettings): string | null {
  if (!isNonNegativeFiniteNumber(settings.minimumNoticeMinutes)) return "Minimum notice must be a non-negative finite number.";
  if (!isNonNegativeFiniteNumber(settings.maximumAdvanceDays)) return "Maximum advance must be a non-negative finite number.";
  if (!Number.isInteger(settings.maximumAdvanceDays)) return "Maximum advance must be a whole number of days.";
  if (!isNonNegativeFiniteNumber(settings.slotIntervalMinutes)) return "Slot interval must be a non-negative finite number.";
  if (settings.slotIntervalMinutes <= 0) return "Slot interval must be greater than zero.";
  if (!Number.isInteger(settings.slotIntervalMinutes)) return "Slot interval must be a whole number of minutes.";
  if (!isNonNegativeFiniteNumber(settings.bufferBeforeMinutes)) return "Buffer before must be a non-negative finite number.";
  if (!isNonNegativeFiniteNumber(settings.bufferAfterMinutes)) return "Buffer after must be a non-negative finite number.";
  if (typeof settings.cancellationAllowed !== "boolean") return "Cancellation availability must be true or false.";
  if (!isNonNegativeFiniteNumber(settings.cancellationDeadlineMinutes)) return "Cancellation deadline must be a non-negative finite number.";
  if (typeof settings.reschedulingAllowed !== "boolean") return "Rescheduling availability must be true or false.";
  if (!isNonNegativeFiniteNumber(settings.reschedulingDeadlineMinutes)) return "Rescheduling deadline must be a non-negative finite number.";
  if (settings.minimumNoticeMinutes > settings.maximumAdvanceDays * 24 * 60) return "Minimum notice cannot be longer than the maximum booking window.";
  return null;
}
