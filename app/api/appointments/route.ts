import { NextResponse } from "next/server";
import { AppointmentBookingError, createAppointment } from "@/lib/appointments/appointment-service";
import { toAppointmentPublicView } from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const appointment = await createAppointment(body);
    return NextResponse.json({ appointment: toAppointmentPublicView(appointment) }, { status: 201 });
  } catch (error) {
    if (error instanceof AppointmentBookingError) {
      const status = error.code === "INVALID_REQUEST" ? 400 : error.code === "UNAVAILABLE" ? 409 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "We couldn't complete the booking. Please try again." }, { status: 500 });
  }
}
