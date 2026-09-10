import { NextResponse } from "next/server";
import {
  createGoogleCalendarOAuthState,
  isGoogleCalendarConfigured,
  requireGoogleCalendarSetupAccess,
} from "@/lib/admin/setup-auth";
import { getGoogleCalendarAuthorizationUrl } from "@/lib/calendar/google-calendar-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireGoogleCalendarSetupAccess();
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json({ error: "Google Calendar OAuth is not fully configured." }, { status: 503 });
    }

    const state = await createGoogleCalendarOAuthState();
    return NextResponse.redirect(getGoogleCalendarAuthorizationUrl(state));
  } catch {
    return NextResponse.json({ error: "Google Calendar setup access is required." }, { status: 401 });
  }
}
