import { availabilityExceptions, availabilityRules } from "@/lib/config/availability";
import { bookingSettings } from "@/lib/config/booking-settings";
import type { Service } from "@/lib/config/services";
import { generateBookableSlots } from "@/lib/booking/slot-engine";
import type {
  BookingConflict,
  SlotGenerationResult,
} from "@/lib/booking/slot-types";

export type BookingSlotRequest = {
  date: string;
  service: Service;
  timezone: string;
  conflicts?: BookingConflict[];
  now?: Date;
};

export function getBookableSlots(
  request: BookingSlotRequest,
): SlotGenerationResult {
  if (!bookingSettings.enabled) {
    return {
      date: request.date,
      timezone: request.timezone,
      slots: [],
    };
  }

  return generateBookableSlots(
    {
      date: request.date,
      service: request.service,
      timezone: request.timezone,
      constraints: bookingSettings,
      availabilityWindows: [],
      exceptions: availabilityExceptions,
      conflicts: request.conflicts ?? [],
      now: request.now,
    },
    availabilityRules,
  );
}
