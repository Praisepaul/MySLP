import type { GoogleCalendarConnectionDocument, GoogleCalendarConnectionStatus } from "@/lib/calendar/google-calendar-types";
import { googleCalendarConnectionId } from "@/lib/calendar/google-calendar-types";
import { getMongoDb } from "@/lib/db/mongodb";

const collectionName = "google_calendar_connections";

export async function getGoogleCalendarConnection(): Promise<GoogleCalendarConnectionDocument | null> {
  const db = await getMongoDb();
  return db
    .collection<GoogleCalendarConnectionDocument>(collectionName)
    .findOne({ _id: googleCalendarConnectionId });
}

export async function saveGoogleCalendarConnection(input: {
  calendarId: string;
  encryptedRefreshToken: string;
}): Promise<void> {
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
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

export async function deleteGoogleCalendarConnection(): Promise<void> {
  const db = await getMongoDb();
  await db.collection<GoogleCalendarConnectionDocument>(collectionName).deleteOne({
    _id: googleCalendarConnectionId,
  });
}

export async function getGoogleCalendarConnectionStatus(): Promise<GoogleCalendarConnectionStatus> {
  const connection = await getGoogleCalendarConnection();
  if (!connection) return { connected: false };

  return {
    connected: true,
    calendarId: connection.calendarId,
    connectedAt: connection.createdAt.toISOString(),
  };
}
