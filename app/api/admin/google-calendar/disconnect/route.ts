import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { deleteGoogleCalendarConnection } from "@/lib/calendar/google-calendar-repository";

export const runtime = "nodejs";

export async function DELETE() {
  try {
    await requireGoogleCalendarSetupAccess();
    await deleteGoogleCalendarConnection();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Google Calendar setup access is required." }, { status: 401 });
  }
}
