import { NextResponse } from "next/server";
import { AdminAuthenticationConfigurationError, loginAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid login request." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!username || !password) return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });

    const result = await loginAdmin(username, password, request);
    if (result === "rate_limited") {
      return NextResponse.json({ error: "Too many sign-in attempts. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": "900" } });
    }
    if (result !== "success") return NextResponse.json({ error: "The username or password is incorrect." }, { status: 401 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthenticationConfigurationError) {
      return NextResponse.json({ error: "Admin login is not configured on this deployment." }, { status: 503 });
    }
    return NextResponse.json({ error: "We couldn't sign you in right now." }, { status: 500 });
  }
}
