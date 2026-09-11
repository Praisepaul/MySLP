import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { consumeGoogleCalendarOAuthState } from "@/lib/admin/setup-auth";
import { connectGoogleCalendar } from "@/lib/calendar/google-calendar-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  try {
    await requireAdminSession();

    if (error) return NextResponse.redirect(new URL("/admin/calendar?error=google_authorization_denied", url.origin));
    if (!code || !state || !(await consumeGoogleCalendarOAuthState(state))) return NextResponse.redirect(new URL("/admin/calendar?error=invalid_oauth_state", url.origin));

    await connectGoogleCalendar(code);
    return NextResponse.redirect(new URL("/admin/calendar?connected=1", url.origin));
  } catch (authOrConnectionError) {
    if (authOrConnectionError instanceof Error && authOrConnectionError.message === "Admin authentication is required.") {
      return NextResponse.redirect(new URL("/admin-login", url.origin));
    }
    return NextResponse.redirect(new URL("/admin/calendar?error=google_calendar_connection_failed", url.origin));
  }
}
