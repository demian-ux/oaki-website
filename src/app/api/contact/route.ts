import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactSchema, attachmentsError } from "@/lib/contact-schema";

// The form posts multipart/form-data (fields + optional files). Plain JSON
// is still accepted for older clients and scripted tests.
async function readRequest(request: Request): Promise<{ fields: unknown; files: File[] }> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) {
    return { fields: await request.json(), files: [] };
  }
  const fd = await request.formData();
  const fields: Record<string, string> = {};
  const files: File[] = [];
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) {
      if (value.size > 0) files.push(value);
    } else {
      fields[key] = value;
    }
  }
  return { fields, files };
}

export async function POST(request: Request) {
  try {
    const { fields, files } = await readRequest(request);
    const data = contactSchema.parse(fields);

    const fileProblem = attachmentsError(files);
    if (fileProblem) {
      return NextResponse.json({ error: fileProblem }, { status: 400 });
    }
    const attachmentNames = files.map((f) => f.name);

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
        attachments: attachmentNames,
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
      const attachments = await Promise.all(
        files.map(async (f) => ({
          filename: f.name,
          content: Buffer.from(await f.arrayBuffer()),
        }))
      );
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
