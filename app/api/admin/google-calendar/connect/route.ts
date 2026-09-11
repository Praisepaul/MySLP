import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { createGoogleCalendarOAuthState, isGoogleCalendarConfigured } from "@/lib/admin/setup-auth";
import { getGoogleCalendarAuthorizationUrl } from "@/lib/calendar/google-calendar-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminSession();
    if (!isGoogleCalendarConfigured()) return NextResponse.json({ error: "Google Calendar OAuth is not fully configured." }, { status: 503 });
    const state = await createGoogleCalendarOAuthState();
    return NextResponse.redirect(getGoogleCalendarAuthorizationUrl(state));
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "Google Calendar could not be connected." }, { status: unauthorized ? 401 : 500 });
  }
}
