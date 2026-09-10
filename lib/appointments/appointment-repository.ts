import { createHash, randomUUID } from "crypto";
import type { ClientSession, ObjectId } from "mongodb";
import type { AppointmentDocument, AppointmentPublicView, GoogleCalendarSyncStatus } from "@/lib/appointments/appointment-types";
import { getMongoClient, getMongoDb } from "@/lib/db/mongodb";

const appointmentsCollection = "appointments";
const bookingLocksCollection = "appointment_booking_locks";
const availabilityRevisionCollection = "availability_revisions";
const availabilityRevisionId = "public-booking";

type BookingLockDocument = { _id?: ObjectId; bucketStart: Date; confirmationToken: string };
type AvailabilityRevisionDocument = { _id: typeof availabilityRevisionId; revision: string; updatedAt: Date };

export async function ensureAppointmentIndexes() {
  const db = await getMongoDb();
  await db.collection<AppointmentDocument>(appointmentsCollection).createIndexes([
    { key: { confirmationToken: 1 }, unique: true, name: "confirmationToken_unique" },
    { key: { idempotencyKey: 1 }, unique: true, name: "idempotencyKey_unique" },
    { key: { startAt: 1, endAt: 1, status: 1 }, name: "active_interval_lookup" },
    { key: { status: 1, startAt: 1 }, name: "status_start_lookup" },
  ]);
  await db.collection(bookingLocksCollection).createIndex({ bucketStart: 1 }, { unique: true, name: "bucketStart_unique" });
}

export async function findAppointmentByIdempotencyKey(idempotencyKey: string) {
  const db = await getMongoDb();
  return db.collection<AppointmentDocument>(appointmentsCollection).findOne({ idempotencyKey });
}

export async function findAppointmentByToken(confirmationToken: string) {
  const db = await getMongoDb();
  return db.collection<AppointmentDocument>(appointmentsCollection).findOne({ confirmationToken });
}

export async function findActiveAppointmentsOverlapping(startAt: Date, endAt: Date) {
  const db = await getMongoDb();
  return db.collection<AppointmentDocument>(appointmentsCollection).find({
    status: "confirmed",
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).toArray();
}

function createAvailabilityRevision() {
  return createHash("sha256").update(`${Date.now()}:${randomUUID()}`).digest("hex");
}

export async function getBookingLocksRevision(): Promise<string> {
  const db = await getMongoDb();
  const revision = await db.collection<AvailabilityRevisionDocument>(availabilityRevisionCollection).findOne(
    { _id: availabilityRevisionId },
    { projection: { revision: 1 } },
  );
  if (revision?.revision) return revision.revision;

  const collection = db.collection<BookingLockDocument>(bookingLocksCollection);
  const [count, latest] = await Promise.all([
    collection.countDocuments(),
    collection.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } }),
  ]);
  return createHash("sha256").update(`${count}:${latest?._id?.toHexString() ?? "none"}`).digest("hex");
}

export async function bumpBookingLocksRevision(session: ClientSession): Promise<string> {
  const db = await getMongoDb();
  const revision = createAvailabilityRevision();
  await db.collection<AvailabilityRevisionDocument>(availabilityRevisionCollection).updateOne(
    { _id: availabilityRevisionId },
    { $set: { revision, updatedAt: new Date() } },
    { upsert: true, session },
  );
  return revision;
}

/** Bumps the public availability revision outside a booking transaction. */
export async function bumpPublicAvailabilityRevision(): Promise<string> {
  const db = await getMongoDb();
  const revision = createAvailabilityRevision();
  await db.collection<AvailabilityRevisionDocument>(availabilityRevisionCollection).updateOne(
    { _id: availabilityRevisionId },
    { $set: { revision, updatedAt: new Date() } },
    { upsert: true },
  );
  return revision;
}

export async function updateGoogleCalendarSyncStatus(input: {
  confirmationToken: string;
  syncStatus: GoogleCalendarSyncStatus;
  eventId?: string;
  error?: string;
}) {
  const db = await getMongoDb();
  const now = new Date();
  const set: Record<string, unknown> = {
    "googleCalendar.syncStatus": input.syncStatus,
    "googleCalendar.lastSyncedAt": now,
  };
  if (input.eventId) set["googleCalendar.eventId"] = input.eventId;
  const update: { $set: Record<string, unknown>; $unset?: Record<string, ""> } = { $set: set };
  if (input.error) set["googleCalendar.lastSyncError"] = input.error;
  else update.$unset = { "googleCalendar.lastSyncError": "" };
  await db.collection<AppointmentDocument>(appointmentsCollection).updateOne({ confirmationToken: input.confirmationToken }, update);
}

export function toAppointmentPublicView(appointment: AppointmentDocument): AppointmentPublicView {
  return {
    confirmationToken: appointment.confirmationToken,
    status: appointment.status,
    service: appointment.service,
    patientName: appointment.patient.name,
    patientEmail: appointment.patient.email,
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    timezone: appointment.timezone,
    createdAt: appointment.createdAt.toISOString(),
    ...(appointment.cancelledAt ? { cancelledAt: appointment.cancelledAt.toISOString() } : {}),
  };
}

export async function cancelAppointment(confirmationToken: string) {
  const client = await getMongoClient();
  const db = await getMongoDb();
  const now = new Date();
  let cancelled: AppointmentDocument | null = null;

  await client.withSession(async (session) => session.withTransaction(async (transactionSession: ClientSession) => {
    const result = await db.collection<AppointmentDocument>(appointmentsCollection).findOneAndUpdate(
      { confirmationToken, status: "confirmed", startAt: { $gt: now } },
      { $set: { status: "cancelled", cancelledAt: now, updatedAt: now } },
      { returnDocument: "after", session: transactionSession },
    );
    if (!result) return;
    cancelled = result;
    await db.collection(bookingLocksCollection).deleteMany({ confirmationToken }, { session: transactionSession });
    await bumpBookingLocksRevision(transactionSession);
  }));
  return cancelled;
}
