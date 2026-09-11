import assert from "node:assert/strict";
import test from "node:test";
import { generateBookableSlots } from "../lib/booking/slot-engine";
import type { AvailabilityRule } from "../lib/config/availability";
import type { Service } from "../lib/config/services";

const service: Service = {
  id: "test-session",
  name: "Test session",
  shortDescription: "Test",
  description: "Test",
  durationMinutes: 60,
  online: true,
  inPerson: false,
  active: true,
  order: 1,
};

const mondayMorning: AvailabilityRule = {
  id: "monday-morning",
  dayOfWeek: "monday",
  startTime: "09:00",
  endTime: "12:00",
  timezone: "Asia/Kolkata",
  active: true,
};

const baseConstraints = {
  minimumNoticeMinutes: 0,
  maximumAdvanceDays: 7,
  slotIntervalMinutes: 60,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
};

test("slot engine generates expected slots from weekly availability", () => {
  const result = generateBookableSlots({
    date: "2026-09-14",
    service,
    timezone: "Asia/Kolkata",
    constraints: baseConstraints,
    availabilityWindows: [],
    exceptions: [],
    conflicts: [],
    now: new Date("2026-09-13T00:00:00.000Z"),
  }, [mondayMorning]);

  assert.deepEqual(result.slots.map((slot) => slot.start.toISOString()), [
    "2026-09-14T03:30:00.000Z",
    "2026-09-14T04:30:00.000Z",
    "2026-09-14T05:30:00.000Z",
  ]);
});

test("slot engine excludes conflicts and partial-day blocked hours", () => {
  const result = generateBookableSlots({
    date: "2026-09-14",
    service,
    timezone: "Asia/Kolkata",
    constraints: baseConstraints,
    availabilityWindows: [],
    exceptions: [
      {
        id: "break",
        date: "2026-09-14",
        type: "unavailable-hours",
        startTime: "10:00",
        endTime: "11:00",
      },
    ],
    conflicts: [
      {
        start: new Date("2026-09-14T04:30:00.000Z"),
        end: new Date("2026-09-14T05:30:00.000Z"),
        source: "appointment",
      },
    ],
    now: new Date("2026-09-13T00:00:00.000Z"),
  }, [mondayMorning]);

  assert.deepEqual(result.slots.map((slot) => slot.start.toISOString()), [
    "2026-09-14T03:30:00.000Z",
    "2026-09-14T05:30:00.000Z",
  ]);
});

test("slot engine respects minimum notice and maximum advance horizon", () => {
  const result = generateBookableSlots({
    date: "2026-09-14",
    service,
    timezone: "Asia/Kolkata",
    constraints: {
      ...baseConstraints,
      minimumNoticeMinutes: 240,
      maximumAdvanceDays: 1,
    },
    availabilityWindows: [],
    exceptions: [],
    conflicts: [],
    now: new Date("2026-09-14T00:00:00.000Z"),
  }, [mondayMorning]);

  assert.deepEqual(result.slots.map((slot) => slot.start.toISOString()), [
    "2026-09-14T04:30:00.000Z",
    "2026-09-14T05:30:00.000Z",
  ]);
});
