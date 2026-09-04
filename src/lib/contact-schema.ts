import { z } from "zod";

/** Message cap, shared by the form counter and the API. */
export const MESSAGE_MAX = 5000;

/** Attachments: shared limits for the form and the API. The total sits
 *  under the 4.5 MB request cap of the serverless route; bigger material
 *  goes through the link field. */
export const ATTACHMENT_MAX_FILES = 3;
export const ATTACHMENT_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.zip";
export const ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
]);

/** One plain-words message for a file list, or null when it is fine. */
export function attachmentsError(files: { name: string; size: number; type: string }[]): string | null {
  if (files.length > ATTACHMENT_MAX_FILES) return `Up to ${ATTACHMENT_MAX_FILES} files, please`;
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > ATTACHMENT_MAX_TOTAL_BYTES) {
    return `Files add up to more than ${ATTACHMENT_MAX_TOTAL_BYTES / 1024 / 1024} MB. Share a link to a folder instead`;
  }
  const bad = files.find((f) => f.type && !ATTACHMENT_TYPES.has(f.type));
  if (bad) return `${bad.name}: PDF, images and ZIP only`;
  return null;
}

// One step, three fields (plus an optional link). The contact page promises
// "you don't need the brief finished" — the form must not demand a brief.
// Legacy wizard fields stay as optionals so older payloads still validate.
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z
    .string()
    .min(10, "Please share a bit more about your project")
    .max(MESSAGE_MAX, `Please keep it under ${MESSAGE_MAX.toLocaleString("en-US")} characters`),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),

  // Legacy fields (pre-collapse wizard) — accepted, never required.
  company: z.string().optional(),
  role: z.string().optional(),
  projectName: z.string().optional(),
  projectLocation: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),
  servicesNeeded: z.array(z.string()).optional(),
  mainGoal: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  estimatedImages: z.string().optional(),
  videoNeeds: z.string().optional(),
  budgetRange: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
