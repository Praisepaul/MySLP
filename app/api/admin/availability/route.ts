import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { bumpPublicAvailabilityRevision } from "@/lib/appointments/appointment-repository";
import { validateAvailabilityException, validateAvailabilityRule, type AvailabilityException, type AvailabilityRule } from "@/lib/config/availability";
import { getAvailabilityConfiguration, saveAvailabilityConfiguration } from "@/lib/cms/availability-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUnauthorized(error: unknown) { return error instanceof Error && error.message === "Google Calendar setup access is required."; }

export async function GET() {
  try { await requireGoogleCalendarSetupAccess(); return NextResponse.json(await getAvailabilityConfiguration()); }
  catch (error) { return NextResponse.json({ error: isUnauthorized(error) ? "Admin access is required." : "We couldn't load availability." }, { status: isUnauthorized(error) ? 401 : 500 }); }
}

export async function PUT(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const body = await request.json();
    const rules = body?.rules as AvailabilityRule[];
    const exceptions = body?.exceptions as AvailabilityException[];
    if (!Array.isArray(rules) || !Array.isArray(exceptions) || rules.length > 100 || exceptions.length > 500) return NextResponse.json({ error: "Invalid availability configuration." }, { status: 400 });
    for (const rule of rules) { const error = validateAvailabilityRule(rule); if (error) return NextResponse.json({ error }, { status: 400 }); }
    for (const exception of exceptions) { const error = validateAvailabilityException(exception); if (error) return NextResponse.json({ error }, { status: 400 }); }
    const saved = await saveAvailabilityConfiguration(rules, exceptions);
    await bumpPublicAvailabilityRevision();
    return NextResponse.json(saved);
  } catch (error) { return NextResponse.json({ error: isUnauthorized(error) ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't save availability." }, { status: isUnauthorized(error) ? 401 : 400 }); }
}
