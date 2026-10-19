import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BOOKING, SlotTakenError, book, bookingMode, bookingRequestSchema } from "@/lib/booking";
import { leadLabel } from "@/lib/lead-source";

export async function POST(request: Request) {
  if (bookingMode() === "off") {
    return NextResponse.json({ error: "Booking is not available" }, { status: 503 });
  }
  try {
    const data = bookingRequestSchema.parse(await request.json());
    const result = await book(data);
    // "Selected work, from Goldman" when booked inside the private set.
    const origin = leadLabel(data);

    // A note to the studio inbox too: Google does not notify the organizer
    // of an event it created on their behalf.
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;
    if (resendKey && contactEmail && !result.mock) {
      const when = new Intl.DateTimeFormat("en-GB", {
        timeZone: BOOKING.timeZone,
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(result.start));
      const { Resend } = await import("resend");
      // Best effort: the event already exists, so a mail failure is logged,
      // not reported to the visitor as a failed booking.
      const { error } = await new Resend(resendKey).emails.send({
        from: "Oaki Studio <noreply@oaki.studio>",
        to: contactEmail,
        replyTo: data.email,
        subject: `Call booked: ${data.name}, ${when}${origin ? ` (${origin})` : ""}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          origin && `Source: ${origin}`,
          `When: ${when} (Buenos Aires)`,
          result.meetLink && `Meet: ${result.meetLink}`,
          data.note && `\nNote:\n${data.note}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      if (error) console.error("[booking] notify", error);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check the details and try again." },
        { status: 400 }
      );
    }
    if (error instanceof SlotTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[booking] create", error);
    return NextResponse.json(
      { error: "We could not book that time. Please try again, or write to info@oaki.studio." },
      { status: 502 }
    );
  }
}
