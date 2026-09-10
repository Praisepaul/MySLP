import { availabilityExceptions, availabilityRules, type AvailabilityException, type AvailabilityRule } from "@/lib/config/availability";
import { bookingSettings, type BookingSettings } from "@/lib/config/booking-settings";
import type { Service } from "@/lib/config/services";
import { generateBookableSlots } from "@/lib/booking/slot-engine";
import type { BookingConflict, SlotGenerationResult } from "@/lib/booking/slot-types";

export type BookingSlotRequest = {
  date: string;
  service: Service;
  timezone: string;
  conflicts?: BookingConflict[];
  now?: Date;
};

export type BookingConfiguration = {
  settings: BookingSettings;
  availabilityRules: AvailabilityRule[];
  availabilityExceptions: AvailabilityException[];
};

export function getBookableSlotsWithConfiguration(request: BookingSlotRequest, configuration: BookingConfiguration): SlotGenerationResult {
  if (!configuration.settings.enabled) return { date: request.date, timezone: request.timezone, slots: [] };
  return generateBookableSlots({ date: request.date, service: request.service, timezone: request.timezone, constraints: configuration.settings, availabilityWindows: [], exceptions: configuration.availabilityExceptions, conflicts: request.conflicts ?? [], now: request.now }, configuration.availabilityRules);
}

export function getBookableSlots(request: BookingSlotRequest): SlotGenerationResult {
  return getBookableSlotsWithConfiguration(request, { settings: bookingSettings, availabilityRules, availabilityExceptions });
}
