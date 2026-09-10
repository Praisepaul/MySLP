import { NextResponse } from "next/server";
import { getBookingLocksRevision } from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const revision = await getBookingLocksRevision();
    return NextResponse.json({ revision });
  } catch {
    return NextResponse.json(
      { error: "We couldn't check availability right now." },
      { status: 503 },
    );
  }
}
