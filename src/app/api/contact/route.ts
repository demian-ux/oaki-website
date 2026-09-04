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
      // Resend reports failures in the result, not by throwing: check it,
      // or a failed send would still answer { ok: true } to the form.
      const { error: sendError } = await resend.emails.send({
        from: "Oaki Studio <noreply@oaki.studio>",
        to: contactEmail,
        subject: data.projectName
          ? `New inquiry from ${data.name} — ${data.projectName}`
          : `New inquiry from ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          data.website && `Link: ${data.website}`,
          data.company && `Company: ${data.company}`,
          data.role && `Role: ${data.role}`,
          data.projectName && `Project: ${data.projectName}`,
          data.projectLocation && `Location: ${data.projectLocation}`,
          data.projectType && `Type: ${data.projectType}`,
          data.projectStage && `Stage: ${data.projectStage}`,
          data.servicesNeeded?.length && `Services: ${data.servicesNeeded.join(", ")}`,
          data.mainGoal?.length && `Goals: ${data.mainGoal.join(", ")}`,
          data.timeline && `Timeline: ${data.timeline}`,
          data.estimatedImages && `Images: ${data.estimatedImages}`,
          data.videoNeeds && `Video: ${data.videoNeeds}`,
          data.budgetRange && `Budget: ${data.budgetRange}`,
          `\nMessage:\n${data.message}`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      if (sendError) throw new Error(`Email failed: ${sendError.message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
