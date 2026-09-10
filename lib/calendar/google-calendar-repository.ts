import type { GoogleCalendarConnectionDocument, GoogleCalendarConnectionStatus, GoogleCalendarBusyInterval } from "@/lib/calendar/google-calendar-types";
import { googleCalendarConnectionId } from "@/lib/calendar/google-calendar-types";
import { getMongoDb } from "@/lib/db/mongodb";

const collectionName = "google_calendar_connections";
const busyCacheCollectionName = "google_calendar_busy_cache";

type GoogleCalendarBusyCacheDocument = {
  _id: typeof googleCalendarConnectionId;
  calendarId: string;
  checkedFrom: Date;
  checkedTo: Date;
  busyIntervals: GoogleCalendarBusyInterval[];
  updatedAt: Date;
};

export async function getGoogleCalendarConnection(): Promise<GoogleCalendarConnectionDocument | null> {
  const db = await getMongoDb();
  return db.collection<GoogleCalendarConnectionDocument>(collectionName).findOne({ _id: googleCalendarConnectionId });
}

export async function saveGoogleCalendarConnection(input: { calendarId: string; encryptedRefreshToken: string }): Promise<void> {
  const db = await getMongoDb();
  const now = new Date();
  await db.collection<GoogleCalendarConnectionDocument>(collectionName).updateOne(
    { _id: googleCalendarConnectionId },
    { $set: { provider: "google", calendarId: input.calendarId, encryptedRefreshToken: input.encryptedRefreshToken, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
}

export async function deleteGoogleCalendarConnection(): Promise<void> {
  const db = await getMongoDb();
  await Promise.all([
    db.collection<GoogleCalendarConnectionDocument>(collectionName).deleteOne({ _id: googleCalendarConnectionId }),
    db.collection<GoogleCalendarBusyCacheDocument>(busyCacheCollectionName).deleteOne({ _id: googleCalendarConnectionId }),
  ]);
}

export async function getGoogleCalendarConnectionStatus(): Promise<GoogleCalendarConnectionStatus> {
  const connection = await getGoogleCalendarConnection();
  if (!connection) return { connected: false };
  return { connected: true, calendarId: connection.calendarId, connectedAt: connection.createdAt.toISOString() };
}

export async function saveGoogleCalendarBusyCache(input: {
  calendarId: string;
  checkedFrom: Date;
  checkedTo: Date;
  busyIntervals: GoogleCalendarBusyInterval[];
}): Promise<void> {
  const db = await getMongoDb();
  await db.collection<GoogleCalendarBusyCacheDocument>(busyCacheCollectionName).updateOne(
    { _id: googleCalendarConnectionId },
    { $set: { calendarId: input.calendarId, checkedFrom: input.checkedFrom, checkedTo: input.checkedTo, busyIntervals: input.busyIntervals, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function getGoogleCalendarBusyCache(start: Date, end: Date): Promise<GoogleCalendarBusyInterval[] | null> {
  const db = await getMongoDb();
  const cached = await db.collection<GoogleCalendarBusyCacheDocument>(busyCacheCollectionName).findOne({
    _id: googleCalendarConnectionId,
    checkedFrom: { $lte: start },
    checkedTo: { $gte: end },
  });
  if (!cached) return null;
  return cached.busyIntervals.filter((interval) => interval.start < end && interval.end > start);
}
