import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { getGoogleCalendarConnectionStatus } from "@/lib/calendar/google-calendar-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireGoogleCalendarSetupAccess();
    return NextResponse.json(await getGoogleCalendarConnectionStatus());
  } catch {
    return NextResponse.json({ error: "Google Calendar setup access is required." }, { status: 401 });
  }
}
