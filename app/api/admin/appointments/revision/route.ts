import { NextResponse } from "next/server";
import { getAppointmentRevision } from "@/lib/appointments/appointment-repository";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ revision: await getAppointmentRevision() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof Error && error.message === "Admin authentication is required." ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? "Admin access is required." : "We couldn't check for updates." }, { status });
  }
}
