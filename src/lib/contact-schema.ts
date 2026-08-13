import { z } from "zod";

// One step, three fields (plus an optional link). The contact page promises
// "you don't need the brief finished" — the form must not demand a brief.
// Legacy wizard fields stay as optionals so older payloads still validate.
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Please share a bit more about your project"),
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
