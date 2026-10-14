import { NextResponse } from "next/server";
import { BOOKING, availableSlots, bookingMode } from "@/lib/booking";

export const dynamic = "force-dynamic";

// Open slot starts (UTC ISO) for the whole horizon, in one response. The
// picker groups and labels them in the visitor's own time zone.
export async function GET() {
  const mode = bookingMode();
  if (mode === "off") {
    return NextResponse.json({ error: "Booking is not available" }, { status: 503 });
  }
  try {
    const slots = await availableSlots();
    return NextResponse.json(
      { mode, slotMinutes: BOOKING.slotMinutes, slots },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[booking] availability", error);
    return NextResponse.json({ error: "Could not load the calendar" }, { status: 502 });
  }
}
