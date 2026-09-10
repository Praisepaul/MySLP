import { NextResponse } from "next/server";
import { getPublicBookableSlots } from "@/lib/booking/public-availability-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const availability = await getPublicBookableSlots(body);

    return NextResponse.json({
      dates: availability.dates,
      slotsByDate: Object.fromEntries(
        Object.entries(availability.slotsByDate).map(([date, slots]) => [
          date,
          slots.map((slot) => ({
            ...slot,
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
          })),
        ]),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "We couldn't check availability right now. Please try again.",
      },
      { status: 400 },
    );
  }
}
