import { z } from "zod";

export const contactSchema = z.object({
  // Step 1 — Who are you?
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  role: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),

  // Step 2 — What are you building?
  projectName: z.string().min(1, "Project name is required"),
  projectLocation: z.string().optional(),
  projectType: z.string().optional(),
  projectStage: z.string().optional(),

  // Step 3 — What do you need?
  servicesNeeded: z.array(z.string()).min(1, "Please select at least one service"),

  // Step 4 — What should the work achieve?
  mainGoal: z.array(z.string()).min(1, "Please select at least one goal"),

  // Step 5 — Timeline and scope
  timeline: z.string().optional(),
  estimatedImages: z.string().optional(),
  videoNeeds: z.string().optional(),
  budgetRange: z.string().optional(),

  // Step 6 — Tell us the story
  message: z.string().min(10, "Please share a bit more about your project"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
