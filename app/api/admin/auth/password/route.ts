import { NextResponse } from "next/server";
import { changeAdminPassword, requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    if (!hasValidOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    await requireAdminSession();
    const body = await request.json().catch(() => ({})) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      return NextResponse.json({ error: "Please enter your current password and a new password." }, { status: 400 });
    }

    if (body.newPassword.length < 15 || body.newPassword.length > 128) {
      return NextResponse.json({ error: "Your new password must be between 15 and 128 characters." }, { status: 400 });
    }

    if (body.currentPassword === body.newPassword) {
      return NextResponse.json({ error: "Your new password must be different from your current password." }, { status: 400 });
    }

    const changed = await changeAdminPassword(body.currentPassword, body.newPassword);
    if (!changed) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    const configuration = error instanceof Error && error.message === "Admin authentication is not configured.";
    return NextResponse.json(
      { error: configuration ? "Admin authentication is not configured." : unauthorized ? "Admin access is required." : "We couldn't change the password right now. Please try again." },
      { status: configuration ? 503 : unauthorized ? 401 : 500 },
    );
  }
}
