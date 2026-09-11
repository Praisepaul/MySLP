import { NextResponse } from "next/server";
import { AdminAuthenticationError, AdminAuthenticationConfigurationError } from "@/lib/admin/auth";
import { getAdminPasskeyStatus } from "@/lib/admin/passkeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAdminPasskeyStatus());
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
    if (error instanceof AdminAuthenticationConfigurationError) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
    return NextResponse.json({ error: "We couldn't load passkey status." }, { status: 500 });
  }
}
