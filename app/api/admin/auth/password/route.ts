import { NextResponse } from "next/server";
import { changeAdminPassword, requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json().catch(() => ({})) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      return NextResponse.json({ error: "Please enter your current password and a new password." }, { status: 400 });
    }

    if (body.newPassword.length < 12) {
      return NextResponse.json({ error: "Your new password must be at least 12 characters." }, { status: 400 });
    }

    if (body.currentPassword === body.newPassword) {
      return NextResponse.json({ error: "Your new password must be different from your current password." }, { status: 400 });
    }

    await changeAdminPassword(body.currentPassword, body.newPassword);
    return NextResponse.json({ success: true });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    const invalidCurrentPassword = error instanceof Error && error.message === "Admin authentication is required.";
    if (unauthorized || invalidCurrentPassword) {
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
    }
    return NextResponse.json({ error: "We couldn't change the password right now. Please try again." }, { status: 500 });
  }
}
