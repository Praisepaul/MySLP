import { NextResponse } from "next/server";
import { beginAdminPasskeyAuthentication } from "@/lib/admin/passkeys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json(await beginAdminPasskeyAuthentication());
  } catch {
    return NextResponse.json({ error: "We couldn't start passkey sign-in." }, { status: 500 });
  }
}
