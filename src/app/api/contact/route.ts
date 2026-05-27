import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Save to Sanity (only when configured)
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const writeToken = process.env.SANITY_API_WRITE_TOKEN;

    if (sanityProjectId && writeToken) {
      const { sanityClient } = await import("@/sanity/client");
      await sanityClient.withConfig({ token: writeToken }).create({
        _type: "formSubmission",
        ...data,
        servicesNeeded: data.servicesNeeded,
        mainGoal: data.mainGoal,
        createdAt: new Date().toISOString(),
        status: "New",
      });
    }

    // Send email via Resend (only when configured)
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (resendKey && contactEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Oaki Studio <noreply@oaki.studio>",
        to: contactEmail,
        subject: `New inquiry from ${data.name} — ${data.projectName}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Company: ${data.company ?? "—"}`,
          `Role: ${data.role ?? "—"}`,
          `Project: ${data.projectName}`,
          `Location: ${data.projectLocation ?? "—"}`,
          `Type: ${data.projectType ?? "—"}`,
          `Stage: ${data.projectStage ?? "—"}`,
          `Services: ${data.servicesNeeded.join(", ")}`,
          `Goals: ${data.mainGoal.join(", ")}`,
          `Timeline: ${data.timeline ?? "—"}`,
          `Images: ${data.estimatedImages ?? "—"}`,
          `Video: ${data.videoNeeds ?? "—"}`,
          `Budget: ${data.budgetRange ?? "—"}`,
          `\nMessage:\n${data.message}`,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
