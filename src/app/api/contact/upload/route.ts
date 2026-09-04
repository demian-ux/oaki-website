import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import {
  ATTACHMENT_MAX_FILE_BYTES,
  ATTACHMENT_TYPES,
} from "@/lib/contact-schema";

// Client-upload handshake for the contact form's attachments. The browser
// asks here for a short-lived token, then sends the file straight to the
// private Blob store (never through a serverless function, so the 4.5 MB
// request cap does not apply). The contact route later reads the blob with
// the server token and attaches it to the notification email.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("contact/")) {
          throw new Error("Unexpected upload path");
        }
        return {
          allowedContentTypes: [...ATTACHMENT_TYPES],
          maximumSizeInBytes: ATTACHMENT_MAX_FILE_BYTES,
          addRandomSuffix: true,
          // A token is good for a few minutes: long enough for a slow
          // upload, short enough not to be worth stealing.
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do here: the form submission carries the blob
        // reference, and the contact route does the rest.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
