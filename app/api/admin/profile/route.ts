import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { getTherapistProfile, saveTherapistProfile, type EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireGoogleCalendarSetupAccess();
    return NextResponse.json({ profile: await getTherapistProfile() });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't load the profile." }, { status: unauthorized ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const profile = await request.json() as EditableTherapistProfile;
    if (!profile || typeof profile !== "object") return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
    const saved = await saveTherapistProfile(profile);
    return NextResponse.json({ profile: saved });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't save the profile." }, { status: unauthorized ? 401 : 400 });
  }
}
