import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { getGoogleCalendarBusyIntervals } from "@/lib/calendar/google-calendar-service";
import { saveGoogleCalendarBusyCache } from "@/lib/calendar/google-calendar-repository";
import { googleCalendarId } from "@/lib/calendar/google-calendar-types";

export const runtime = "nodejs";

export async function POST() {
  try {
    await requireGoogleCalendarSetupAccess();
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const busyIntervals = await getGoogleCalendarBusyIntervals(start, end);

    if (busyIntervals !== null) {
      await saveGoogleCalendarBusyCache({ calendarId: googleCalendarId, checkedFrom: start, checkedTo: end, busyIntervals });
    }

    return NextResponse.json({
      ok: true,
      checkedFrom: start.toISOString(),
      checkedTo: end.toISOString(),
      busyIntervals: busyIntervals?.map((interval) => ({ start: interval.start.toISOString(), end: interval.end.toISOString() })) ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Calendar synchronization failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
