import { NextResponse } from "next/server";
import { getAppointmentRevision } from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ revision: await getAppointmentRevision() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "We couldn't check for updates." }, { status: 500 });
  }
}
