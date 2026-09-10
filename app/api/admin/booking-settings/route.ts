import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { bumpPublicAvailabilityRevision } from "@/lib/appointments/appointment-repository";
import { getBookingSettings, saveBookingSettings, type EditableBookingSettings } from "@/lib/cms/site-settings-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireGoogleCalendarSetupAccess();
    return NextResponse.json({ settings: await getBookingSettings() });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't load booking settings." }, { status: unauthorized ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const settings = await request.json() as EditableBookingSettings;
    if (!settings || typeof settings !== "object") return NextResponse.json({ error: "Invalid booking settings." }, { status: 400 });
    const saved = await saveBookingSettings(settings);
    await bumpPublicAvailabilityRevision();
    return NextResponse.json({ settings: saved });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't save booking settings." }, { status: unauthorized ? 401 : 400 });
  }
}
