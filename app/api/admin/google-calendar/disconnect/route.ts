import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { deleteGoogleCalendarConnection } from "@/lib/calendar/google-calendar-repository";

export const runtime = "nodejs";

export async function DELETE() {
  try {
    await requireAdminSession();
    await deleteGoogleCalendarConnection();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "Google Calendar could not be disconnected." }, { status: unauthorized ? 401 : 500 });
  }
}
