import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";

  // In production, require the preview secret. In local dev we skip the check
  // so visiting /api/draft directly Just Works — there's no public endpoint
  // to abuse, and the convenience matters during content authoring.
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  // Redirect to the requested path
  redirect(slug.startsWith("/") ? slug : `/${slug}`);
}
