import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactSchema, attachmentsError } from "@/lib/contact-schema";

// Attachments arrive as references to blobs the browser already uploaded
// (see ./upload/route.ts). Read each one back from the private store and
// hand it to Resend as a real attachment.
async function loadAttachments(
  refs: { name: string; pathname: string }[]
): Promise<{ filename: string; content: Buffer }[]> {
  if (refs.length === 0) return [];
  const { get } = await import("@vercel/blob");
  return Promise.all(
    refs.map(async (ref) => {
      const res = await get(ref.pathname, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200 || !res.stream) {
        throw new Error(`Could not read the attachment ${ref.name}`);
      }
      const bytes = await new Response(res.stream).arrayBuffer();
      return { filename: ref.name, content: Buffer.from(bytes) };
    })
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);
    const refs = data.attachments ?? [];

    const fileProblem = attachmentsError(refs);
    if (fileProblem) {
      return NextResponse.json({ error: fileProblem }, { status: 400 });
    }
    const attachmentNames = refs.map((f) => f.name);

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
        // Name plus the private blob path, so a file can be pulled from the
        // store later even if the email is gone.
        attachments: refs.map((f) => `${f.name} · ${f.pathname}`),
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
      const attachments = await loadAttachments(refs);
      // Resend reports failures in the result, not by throwing: check it,
      // or a failed send would still answer { ok: true } to the form.
      const { error: sendError } = await resend.emails.send({
        from: "Oaki Studio <noreply@oaki.studio>",
        to: contactEmail,
        replyTo: data.email,
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
          attachmentNames.length && `Attachments: ${attachmentNames.join(", ")}`,
          `\nMessage:\n${data.message}`,
        ]
          .filter(Boolean)
          .join("\n"),
        attachments,
      });
      if (sendError) throw new Error(`Email failed: ${sendError.message}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Validation: answer with the first issue in plain words, never the raw
    // issue list (the form shows this string as-is).
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Please check the form and try again." },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
