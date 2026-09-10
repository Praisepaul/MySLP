import type { BookingConstraints } from "@/lib/booking/slot-types";

export type BookingSettings = BookingConstraints & {
  enabled: boolean;
};

export const bookingSettings: BookingSettings = {
  enabled: true,
  minimumNoticeMinutes: 24 * 60,
  maximumAdvanceDays: 60,
  slotIntervalMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 10,
};

function isNonNegativeFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateBookingSettings(
  settings: BookingSettings,
): string | null {
  if (!isNonNegativeFiniteNumber(settings.minimumNoticeMinutes)) {
    return "Minimum notice must be a non-negative finite number.";
  }

  if (!isNonNegativeFiniteNumber(settings.maximumAdvanceDays)) {
    return "Maximum advance must be a non-negative finite number.";
  }

  if (!Number.isInteger(settings.maximumAdvanceDays)) {
    return "Maximum advance must be a whole number of days.";
  }

  if (!isNonNegativeFiniteNumber(settings.slotIntervalMinutes)) {
    return "Slot interval must be a non-negative finite number.";
  }

  if (settings.slotIntervalMinutes <= 0) {
    return "Slot interval must be greater than zero.";
  }

  if (!Number.isInteger(settings.slotIntervalMinutes)) {
    return "Slot interval must be a whole number of minutes.";
  }

  if (!isNonNegativeFiniteNumber(settings.bufferBeforeMinutes)) {
    return "Buffer before must be a non-negative finite number.";
  }

  if (!isNonNegativeFiniteNumber(settings.bufferAfterMinutes)) {
    return "Buffer after must be a non-negative finite number.";
  }

  return null;
}
