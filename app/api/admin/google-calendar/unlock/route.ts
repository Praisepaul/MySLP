import { NextResponse } from "next/server";
import { isGoogleCalendarConfigured, isSetupSecretConfigured, unlockGoogleCalendarSetup } from "@/lib/admin/setup-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSetupSecretConfigured()) {
    return NextResponse.json({ error: "Google Calendar setup access is not configured." }, { status: 503 });
  }

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ error: "Google Calendar OAuth is not fully configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null;
  const secret = typeof body?.secret === "string" ? body.secret : "";
  const unlocked = await unlockGoogleCalendarSetup(secret);

  if (!unlocked) {
    return NextResponse.json({ error: "Invalid setup key." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
