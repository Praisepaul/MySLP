import { NextResponse } from "next/server";
import { establishAdminSession } from "@/lib/admin/auth";
import { finishAdminPasskeyAuthentication } from "@/lib/admin/passkeys";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as AuthenticationResponseJSON | null;
    if (!body?.id || !body?.response) return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
    const verified = await finishAdminPasskeyAuthentication(request, body);
    if (!verified) return NextResponse.json({ error: "That passkey is not registered for this therapist account." }, { status: 401 });
    await establishAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "We couldn't sign you in with your passkey." }, { status: 400 });
  }
}
