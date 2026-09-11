export const googleCalendarConnectionId = "therapist";

export type GoogleCalendarConnectionDocument = {
  _id: typeof googleCalendarConnectionId;
  provider: "google";
  calendarId: string;
  encryptedRefreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};
export type GoogleCalendarConnectionStatus = { connected: boolean; calendarId?: string; connectedAt?: string };
export type GoogleCalendarBusyInterval = { start: Date; end: Date };
export type GoogleCalendarEvent = { id: string; title: string; start: Date; end: Date; status?: string; htmlLink?: string };
