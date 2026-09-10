import type {
  BookingConflict,
  BookingInterval,
} from "@/lib/booking/slot-types";
import { addMinutes, intervalsOverlap } from "@/lib/booking/time-utils";

export type BookingConflictCheck = BookingInterval & {
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
};

function validateInterval(interval: BookingInterval): void {
  if (Number.isNaN(interval.start.getTime())) {
    throw new Error("Booking interval start must be a valid date.");
  }

  if (Number.isNaN(interval.end.getTime())) {
    throw new Error("Booking interval end must be a valid date.");
  }

  if (interval.start >= interval.end) {
    throw new Error("Booking interval end must be later than its start.");
  }
}

function validateBuffer(minutes: number, name: string): void {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error(`${name} must be a non-negative finite number.`);
  }
}

export function expandIntervalForConflictCheck(
  interval: BookingInterval,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): BookingInterval {
  validateInterval(interval);
  validateBuffer(bufferBeforeMinutes, "Buffer before minutes");
  validateBuffer(bufferAfterMinutes, "Buffer after minutes");

  return {
    start: addMinutes(interval.start, -bufferBeforeMinutes),
    end: addMinutes(interval.end, bufferAfterMinutes),
  };
}

export function findBookingConflicts(
  candidate: BookingConflictCheck,
  conflicts: BookingConflict[],
): BookingConflict[] {
  const expandedCandidate = expandIntervalForConflictCheck(
    candidate,
    candidate.bufferBeforeMinutes,
    candidate.bufferAfterMinutes,
  );

  return conflicts.filter((conflict) => {
    validateInterval(conflict);

    return intervalsOverlap(
      expandedCandidate.start,
      expandedCandidate.end,
      conflict.start,
      conflict.end,
    );
  });
}

export function hasBookingConflict(
  candidate: BookingConflictCheck,
  conflicts: BookingConflict[],
): boolean {
  return findBookingConflicts(candidate, conflicts).length > 0;
}

export function groupBookingConflictsBySource(
  conflicts: BookingConflict[],
): Record<BookingConflict["source"], BookingConflict[]> {
  return {
    appointment: conflicts.filter(
      (conflict) => conflict.source === "appointment",
    ),
    calendar: conflicts.filter(
      (conflict) => conflict.source === "calendar",
    ),
  };
}
