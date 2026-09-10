import type { GoogleCalendarConnectionDocument, GoogleCalendarConnectionStatus, GoogleCalendarBusyInterval } from "@/lib/calendar/google-calendar-types";
import { googleCalendarConnectionId } from "@/lib/calendar/google-calendar-types";
import { getMongoDb } from "@/lib/db/mongodb";

const collectionName = "google_calendar_connections";
const busyCacheCollectionName = "google_calendar_busy_cache";
const discoveredConflictCollectionName = "google_calendar_discovered_conflicts";

type GoogleCalendarBusyCacheDocument = {
  _id: typeof googleCalendarConnectionId;
  calendarId: string;
  checkedFrom: Date;
  checkedTo: Date;
  busyIntervals: GoogleCalendarBusyInterval[];
  updatedAt: Date;
};

type GoogleCalendarDiscoveredConflictDocument = {
  _id: string;
  calendarId: string;
  start: Date;
  end: Date;
  discoveredAt: Date;
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
    {
      $set: {
        provider: "google",
        calendarId: input.calendarId,
        encryptedRefreshToken: input.encryptedRefreshToken,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

export async function deleteGoogleCalendarConnection(): Promise<void> {
  const db = await getMongoDb();
  await Promise.all([
    db.collection<GoogleCalendarConnectionDocument>(collectionName).deleteOne({ _id: googleCalendarConnectionId }),
    db.collection<GoogleCalendarBusyCacheDocument>(busyCacheCollectionName).deleteOne({ _id: googleCalendarConnectionId }),
    db.collection<GoogleCalendarDiscoveredConflictDocument>(discoveredConflictCollectionName).deleteMany({ calendarId: googleCalendarConnectionId }),
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
    {
      $set: {
        calendarId: input.calendarId,
        checkedFrom: input.checkedFrom,
        checkedTo: input.checkedTo,
        busyIntervals: input.busyIntervals,
        updatedAt: new Date(),
      },
    },
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

function getDiscoveredConflictId(calendarId: string, start: Date, end: Date) {
  return `${calendarId}:${start.toISOString()}:${end.toISOString()}`;
}

/** Stores a conflict learned from a live booking-time Google check. */
export async function saveDiscoveredGoogleCalendarConflict(input: {
  calendarId: string;
  start: Date;
  end: Date;
}): Promise<boolean> {
  const db = await getMongoDb();
  const result = await db.collection<GoogleCalendarDiscoveredConflictDocument>(discoveredConflictCollectionName).updateOne(
    { _id: getDiscoveredConflictId(input.calendarId, input.start, input.end) },
    {
      $setOnInsert: {
        calendarId: input.calendarId,
        start: input.start,
        end: input.end,
        discoveredAt: new Date(),
      },
    },
    { upsert: true },
  );
  return result.upsertedCount > 0;
}

export async function getDiscoveredGoogleCalendarConflicts(start: Date, end: Date): Promise<GoogleCalendarBusyInterval[]> {
  const db = await getMongoDb();
  const conflicts = await db.collection<GoogleCalendarDiscoveredConflictDocument>(discoveredConflictCollectionName).find({
    calendarId: googleCalendarConnectionId,
    start: { $lt: end },
    end: { $gt: start },
  }).toArray();
  return conflicts.map((conflict) => ({ start: conflict.start, end: conflict.end }));
}

/** Removes learned conflicts that were covered by a fresh Google sync. */
export async function clearDiscoveredGoogleCalendarConflicts(start: Date, end: Date): Promise<void> {
  const db = await getMongoDb();
  await db.collection<GoogleCalendarDiscoveredConflictDocument>(discoveredConflictCollectionName).deleteMany({
    calendarId: googleCalendarConnectionId,
    start: { $lt: end },
    end: { $gt: start },
  });
}
