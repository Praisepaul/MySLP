import type { ClientSession, ObjectId } from "mongodb";
import type { AppointmentDocument, AppointmentPublicView } from "@/lib/appointments/appointment-types";
import { getMongoClient, getMongoDb } from "@/lib/db/mongodb";

const appointmentsCollection = "appointments";
const bookingLocksCollection = "appointment_booking_locks";

type BookingLockDocument = {
  _id?: ObjectId;
  bucketStart: Date;
  confirmationToken: string;
};

export async function ensureAppointmentIndexes() {
  const db = await getMongoDb();
  await db.collection<AppointmentDocument>(appointmentsCollection).createIndexes([
    { key: { confirmationToken: 1 }, unique: true, name: "confirmationToken_unique" },
    { key: { idempotencyKey: 1 }, unique: true, name: "idempotencyKey_unique" },
    { key: { startAt: 1, endAt: 1, status: 1 }, name: "active_interval_lookup" },
    { key: { status: 1, startAt: 1 }, name: "status_start_lookup" },
  ]);

  await db.collection(bookingLocksCollection).createIndex(
    { bucketStart: 1 },
    { unique: true, name: "bucketStart_unique" },
  );
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

export async function getBookingLocksRevision(): Promise<string> {
  const db = await getMongoDb();
  const collection = db.collection<BookingLockDocument>(bookingLocksCollection);
  const [count, latest] = await Promise.all([
    collection.countDocuments(),
    collection.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } }),
  ]);

  return `${count}:${latest?._id?.toHexString() ?? "none"}`;
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

  await client.withSession(async (session) =>
    session.withTransaction(async (transactionSession: ClientSession) => {
      const result = await db.collection<AppointmentDocument>(appointmentsCollection).findOneAndUpdate(
        { confirmationToken, status: "confirmed", startAt: { $gt: now } },
        { $set: { status: "cancelled", cancelledAt: now, updatedAt: now } },
        { returnDocument: "after", session: transactionSession },
      );

      if (!result) return;

      cancelled = result;
      await db.collection(bookingLocksCollection).deleteMany(
        { confirmationToken },
        { session: transactionSession },
      );
    }),
  );

  return cancelled;
}
