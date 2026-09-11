import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getGoogleCalendarConnectionStatus } from "@/lib/calendar/google-calendar-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json(await getGoogleCalendarConnectionStatus());
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "Google Calendar status could not be loaded." }, { status: unauthorized ? 401 : 500 });
  }
}
