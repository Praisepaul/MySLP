import { NextResponse } from "next/server";
import { consumeGoogleCalendarOAuthState, requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { connectGoogleCalendar } from "@/lib/calendar/google-calendar-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  try {
    await requireGoogleCalendarSetupAccess();

    if (error) {
      return NextResponse.redirect(new URL(`/admin/calendar?error=${encodeURIComponent(error)}`, url.origin));
    }

    if (!code || !state || !(await consumeGoogleCalendarOAuthState(state))) {
      return NextResponse.redirect(new URL("/admin/calendar?error=invalid_oauth_state", url.origin));
    }

    await connectGoogleCalendar(code);
    return NextResponse.redirect(new URL("/admin/calendar?connected=1", url.origin));
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "google_calendar_connection_failed";
    return NextResponse.redirect(new URL(`/admin/calendar?error=${encodeURIComponent(message)}`, url.origin));
  }
}
