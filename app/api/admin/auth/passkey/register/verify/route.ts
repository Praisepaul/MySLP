import { NextResponse } from "next/server";
import { AdminAuthenticationError, AdminAuthenticationConfigurationError } from "@/lib/admin/auth";
import { finishAdminPasskeyRegistration } from "@/lib/admin/passkeys";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as RegistrationResponseJSON | null;
    if (!body?.id || !body?.response) return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
    await finishAdminPasskeyRegistration(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
    if (error instanceof AdminAuthenticationConfigurationError) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "We couldn't save the passkey." }, { status: 400 });
  }
}
