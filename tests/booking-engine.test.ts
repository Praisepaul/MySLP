import assert from "node:assert/strict";
import test from "node:test";
import {
  addMinutes,
  formatMinutesToTime,
  intervalsOverlap,
  parseTimeToMinutes,
} from "../lib/booking/time-utils";
import {
  expandIntervalForConflictCheck,
  findBookingConflicts,
  groupBookingConflictsBySource,
  hasBookingConflict,
} from "../lib/booking/conflict-engine";
import {
  isFullDayException,
  isPartialDayException,
  validateAvailabilityException,
  validateAvailabilityRule,
} from "../lib/config/availability";

test("time utilities preserve 24-hour scheduling semantics", () => {
  assert.equal(parseTimeToMinutes("00:00"), 0);
  assert.equal(parseTimeToMinutes("23:59"), 1439);
  assert.equal(formatMinutesToTime(0), "00:00");
  assert.equal(formatMinutesToTime(1439), "23:59");
  assert.equal(formatMinutesToTime(1440), "00:00");
  assert.equal(addMinutes(new Date("2026-09-14T09:00:00Z"), 90).toISOString(), "2026-09-14T10:30:00.000Z");
  assert.equal(intervalsOverlap(
    new Date("2026-09-14T09:00:00Z"),
    new Date("2026-09-14T10:00:00Z"),
    new Date("2026-09-14T10:00:00Z"),
    new Date("2026-09-14T11:00:00Z"),
  ), false);
});

test("invalid scheduling times are rejected", () => {
  assert.throws(() => parseTimeToMinutes("9:00"));
  assert.throws(() => parseTimeToMinutes("24:00"));
  assert.throws(() => parseTimeToMinutes("12:60"));
  assert.throws(() => formatMinutesToTime(Number.NaN));
});

test("booking buffers participate in conflict detection", () => {
  const candidate = {
    start: new Date("2026-09-14T10:00:00Z"),
    end: new Date("2026-09-14T11:00:00Z"),
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
  };
  const conflicts = [
    {
      start: new Date("2026-09-14T08:00:00Z"),
      end: new Date("2026-09-14T09:45:00Z"),
      source: "appointment" as const,
    },
    {
      start: new Date("2026-09-14T11:10:00Z"),
      end: new Date("2026-09-14T12:00:00Z"),
      source: "calendar" as const,
    },
  ];

  assert.equal(expandIntervalForConflictCheck(candidate, 15, 15).start.toISOString(), "2026-09-14T09:45:00.000Z");
  assert.equal(hasBookingConflict(candidate, conflicts), true);
  assert.equal(findBookingConflicts(candidate, conflicts).length, 1);
  const grouped = groupBookingConflictsBySource(conflicts);
  assert.equal(grouped.appointment.length, 1);
  assert.equal(grouped.calendar.length, 1);
});

test("availability validation distinguishes full-day and partial exceptions", () => {
  const rule = {
    id: "monday",
    dayOfWeek: "monday" as const,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  };
  assert.equal(validateAvailabilityRule(rule), null);
  assert.notEqual(validateAvailabilityRule({ ...rule, startTime: "17:00", endTime: "09:00" }), null);

  const fullDay = { id: "holiday", date: "2026-09-14", type: "unavailable" as const };
  const partial = { id: "break", date: "2026-09-14", type: "unavailable-hours" as const, startTime: "13:00", endTime: "14:00" };
  assert.equal(validateAvailabilityException(fullDay), null);
  assert.equal(validateAvailabilityException(partial), null);
  assert.equal(isFullDayException(fullDay), true);
  assert.equal(isPartialDayException(partial), true);
  assert.notEqual(validateAvailabilityException({ ...partial, endTime: "12:00" }), null);
});
