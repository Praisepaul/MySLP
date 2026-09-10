import { NextResponse } from "next/server";
import { cancelAppointment, findAppointmentByToken, toAppointmentPublicView } from "@/lib/appointments/appointment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ confirmationToken: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  if (!confirmationToken || confirmationToken.length > 100) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const appointment = await findAppointmentByToken(confirmationToken);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { confirmationToken } = await context.params;
  if (!confirmationToken || confirmationToken.length > 100) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const appointment = await cancelAppointment(confirmationToken);
  if (!appointment) {
    const existing = await findAppointmentByToken(confirmationToken);
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "This appointment can no longer be cancelled online." }, { status: 409 });
  }

  return NextResponse.json({ appointment: toAppointmentPublicView(appointment) });
}
