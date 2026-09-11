import { NextResponse } from "next/server";
import { AdminAuthenticationError, AdminAuthenticationConfigurationError } from "@/lib/admin/auth";
import { beginAdminPasskeyRegistration } from "@/lib/admin/passkeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await beginAdminPasskeyRegistration(request));
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return NextResponse.json({ error: "Admin authentication is required." }, { status: 401 });
    if (error instanceof AdminAuthenticationConfigurationError) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
    return NextResponse.json({ error: "We couldn't start passkey setup." }, { status: 500 });
  }
}
