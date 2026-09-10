import { randomUUID } from "crypto";
import { MongoServerError } from "mongodb";
import { bookingSettings } from "@/lib/config/booking-settings";
import { services } from "@/lib/config/services";
import {
  findActiveAppointmentsOverlapping,
  findAppointmentByIdempotencyKey,
  ensureAppointmentIndexes,
  bumpBookingLocksRevision,
  bumpPublicAvailabilityRevision,
  updateGoogleCalendarSyncStatus,
} from "@/lib/appointments/appointment-repository";
import { getBookableSlots } from "@/lib/booking/booking-engine";
import { getGoogleCalendarBusyIntervals } from "@/lib/calendar/google-calendar-service";
import {
  saveDiscoveredGoogleCalendarConflict,
} from "@/lib/calendar/google-calendar-repository";
import { createGoogleCalendarAppointmentEvent } from "@/lib/calendar/google-calendar-event-service";
import { googleCalendarConnectionId } from "@/lib/calendar/google-calendar-types";
import { getMongoClient, getMongoDb } from "@/lib/db/mongodb";
import type { AppointmentDocument } from "@/lib/appointments/appointment-types";

const appointmentsCollection = "appointments";
const bookingLocksCollection = "appointment_booking_locks";
const bucketMilliseconds = 30 * 60 * 1000;

export class AppointmentBookingError extends Error {
  constructor(
    public readonly code: "INVALID_REQUEST" | "UNAVAILABLE" | "DATABASE",
    message: string,
  ) {
    super(message);
    this.name = "AppointmentBookingError";
  }
}

function assertTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please choose a valid timezone.");
  }
}

function getDateInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function getBookingBuckets(startAt: Date, endAt: Date) {
  const first = Math.floor(startAt.getTime() / bucketMilliseconds) * bucketMilliseconds;
  const buckets: Date[] = [];
  for (let timestamp = first; timestamp < endAt.getTime(); timestamp += bucketMilliseconds) {
    buckets.push(new Date(timestamp));
  }
  return buckets;
}

function validateRequest(input: {
  serviceId: unknown;
  startAt: unknown;
  timezone: unknown;
  name: unknown;
  email: unknown;
  idempotencyKey: unknown;
}) {
  if (typeof input.serviceId !== "string" || input.serviceId.length > 100) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please choose a valid service.");
  }
  if (typeof input.startAt !== "string") {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please choose a valid appointment time.");
  }
  if (typeof input.timezone !== "string" || input.timezone.length > 100) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please choose a valid timezone.");
  }
  if (typeof input.name !== "string" || input.name.trim().length < 2 || input.name.trim().length > 120) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please enter your name.");
  }
  if (
    typeof input.email !== "string" ||
    input.email.trim().length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please enter a valid email address.");
  }
  if (
    typeof input.idempotencyKey !== "string" ||
    input.idempotencyKey.length < 16 ||
    input.idempotencyKey.length > 100
  ) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please try submitting the booking again.");
  }
}

export async function createAppointment(input: {
  serviceId: unknown;
  startAt: unknown;
  timezone: unknown;
  name: unknown;
  email: unknown;
  idempotencyKey: unknown;
}) {
  validateRequest(input);

  if (!bookingSettings.enabled) {
    throw new AppointmentBookingError("UNAVAILABLE", "Online booking is currently unavailable.");
  }

  const existingRequest = await findAppointmentByIdempotencyKey(input.idempotencyKey as string);
  if (existingRequest) return existingRequest;

  const service = services.find((item) => item.id === input.serviceId && item.active);
  if (!service) {
    throw new AppointmentBookingError("INVALID_REQUEST", "That service is no longer available.");
  }

  const startAt = new Date(input.startAt as string);
  if (Number.isNaN(startAt.getTime())) {
    throw new AppointmentBookingError("INVALID_REQUEST", "Please choose a valid appointment time.");
  }

  assertTimezone(input.timezone as string);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);
  const conflictStart = new Date(startAt.getTime() - bookingSettings.bufferBeforeMinutes * 60 * 1000);
  const conflictEnd = new Date(endAt.getTime() + bookingSettings.bufferAfterMinutes * 60 * 1000);
  const date = getDateInTimezone(startAt, input.timezone as string);

  const appointmentConflicts = (await findActiveAppointmentsOverlapping(conflictStart, conflictEnd)).map(
    (appointment) => ({
      start: appointment.startAt,
      end: appointment.endAt,
      source: "appointment" as const,
    }),
  );

  let calendarConflicts;
  try {
    calendarConflicts = await getGoogleCalendarBusyIntervals(conflictStart, conflictEnd);
  } catch {
    throw new AppointmentBookingError(
      "UNAVAILABLE",
      "We couldn't verify the therapist's calendar right now. Please try again in a moment.",
    );
  }

  const conflicts = [
    ...appointmentConflicts,
    ...(calendarConflicts ?? []).map((interval) => ({
      start: interval.start,
      end: interval.end,
      source: "calendar" as const,
    })),
  ];

  const availableSlots = getBookableSlots({
    date,
    service,
    timezone: input.timezone as string,
    conflicts,
    now: new Date(),
  }).slots;
  const requestedSlot = availableSlots.find(
    (slot) => slot.start.getTime() === startAt.getTime() && slot.end.getTime() === endAt.getTime(),
  );

  if (!requestedSlot) {
    if (calendarConflicts?.length) {
      const learned = await Promise.all(
        calendarConflicts.map((interval) =>
          saveDiscoveredGoogleCalendarConflict({
            calendarId: googleCalendarConnectionId,
            start: interval.start,
            end: interval.end,
          }),
        ),
      );
      if (learned.some(Boolean)) {
        await bumpPublicAvailabilityRevision();
      }
    }

    throw new AppointmentBookingError(
      "UNAVAILABLE",
      "That time is no longer available. Please choose another slot.",
    );
  }

  await ensureAppointmentIndexes();
  const client = await getMongoClient();
  const db = await getMongoDb();
  const confirmationToken = randomUUID();
  const now = new Date();

  const appointment: AppointmentDocument = {
    confirmationToken,
    idempotencyKey: input.idempotencyKey as string,
    status: "confirmed",
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      online: service.online,
      inPerson: service.inPerson,
    },
    patient: {
      name: (input.name as string).trim(),
      email: (input.email as string).trim().toLowerCase(),
    },
    startAt,
    endAt,
    timezone: input.timezone as string,
    createdAt: now,
    updatedAt: now,
    googleCalendar: { syncStatus: "pending" },
  };

  try {
    await client.withSession(async (session) =>
      session.withTransaction(async (transactionSession) => {
        const locks = getBookingBuckets(startAt, endAt).map((bucketStart) => ({
          bucketStart,
          confirmationToken,
        }));
        await db.collection(bookingLocksCollection).insertMany(locks, { session: transactionSession });
        await db.collection<AppointmentDocument>(appointmentsCollection).insertOne(appointment, {
          session: transactionSession,
        });
        await bumpBookingLocksRevision(transactionSession);
      }),
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const duplicateRequest = await findAppointmentByIdempotencyKey(input.idempotencyKey as string);
      if (duplicateRequest) return duplicateRequest;
      throw new AppointmentBookingError(
        "UNAVAILABLE",
        "That time was just booked by someone else. Please choose another slot.",
      );
    }
    throw new AppointmentBookingError("DATABASE", "We couldn't save the appointment. Please try again.");
  }

  try {
    const eventId = await createGoogleCalendarAppointmentEvent(appointment);
    await updateGoogleCalendarSyncStatus({
      confirmationToken,
      syncStatus: eventId ? "synced" : "not_connected",
      ...(eventId ? { eventId } : {}),
    });
  } catch (error) {
    await updateGoogleCalendarSyncStatus({
      confirmationToken,
      syncStatus: "failed",
      error: error instanceof Error ? error.message.slice(0, 500) : "Google Calendar event creation failed.",
    });
  }

  return appointment;
}
