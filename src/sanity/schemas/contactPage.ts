import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons";

export default defineType({
  name: "contactPage",
  title: "Contact",
  type: "document",
  icon: EnvelopeIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "form", title: "Form" },
    { name: "options", title: "Field Options" },
    { name: "thanks", title: "Thank You" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Hero
    defineField({
      name: "heroLabel",
      title: "Hero — Eyebrow",
      type: "string",
      group: "hero",
      initialValue: "Start a project",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — Headline",
      type: "string",
      group: "hero",
      initialValue: "Tell us what you are building.",
    }),
    defineField({
      name: "heroText",
      title: "Hero — Subtext",
      type: "text",
      rows: 2,
      group: "hero",
      initialValue:
        "Share the project, the timeline, and what the images need to do. We reply within two hours.",
    }),

    // Form step titles
    defineField({
      name: "stepTitles",
      title: "Step Titles",
      type: "array",
      of: [{ type: "string" }],
      group: "form",
      validation: (r) => r.length(6).warning("Form has 6 steps."),
      initialValue: [
        "Who are you?",
        "What are you building?",
        "What do you need?",
        "What should the work achieve?",
        "Timeline and scope",
        "Tell us the story.",
      ],
    }),
    defineField({
      name: "continueLabel",
      title: "Continue Button Label",
      type: "string",
      group: "form",
      initialValue: "Continue →",
    }),
    defineField({
      name: "backLabel",
      title: "Back Link Label",
      type: "string",
      group: "form",
      initialValue: "← Back",
    }),
    defineField({
      name: "submitLabel",
      title: "Submit Button Label",
      type: "string",
      group: "form",
      initialValue: "Start a project",
    }),
    defineField({
      name: "submittingLabel",
      title: "Submit — Loading State",
      type: "string",
      group: "form",
      initialValue: "Sending…",
    }),
    defineField({
      name: "messagePrompt",
      title: "Step 6 — Message Prompt",
      type: "text",
      rows: 2,
      group: "form",
      initialValue:
        "Share the project, the ambition, and what the images need to achieve.",
    }),

    // Field options
    defineField({
      name: "services",
      title: "Services — Options",
      type: "array",
      of: [{ type: "string" }],
      group: "options",
      initialValue: [
        "Still images",
        "Film / animation",
        "Narrative direction",
        "Competition visuals",
        "Marketing package",
        "Design exploration",
        "Not sure yet",
      ],
    }),
    defineField({
      name: "goals",
      title: "Goals — Options",
      type: "array",
      of: [{ type: "string" }],
      group: "options",
      initialValue: [
        "Sell the project",
        "Get approval",
        "Win a competition",
        "Align stakeholders",
        "Shape the design",
        "Launch a campaign",
      ],
    }),
    defineField({
      name: "projectTypeOptions",
      title: "Project Types — Options",
      type: "array",
      of: [{ type: "string" }],
      group: "options",
      initialValue: [
        "Residential",
        "Hospitality",
        "Education",
        "Cultural",
        "Commercial",
        "Competition",
        "Interior",
        "Mixed-use",
      ],
    }),
    defineField({
      name: "projectStageOptions",
      title: "Project Stages — Options",
      type: "array",
      of: [{ type: "string" }],
      group: "options",
      initialValue: [
        "Concept",
        "Schematic Design",
        "Design Development",
        "Construction Documents",
        "Under Construction",
      ],
    }),
    defineField({
      name: "budgetOptions",
      title: "Budget Ranges — Options",
      type: "array",
      of: [{ type: "string" }],
      group: "options",
      initialValue: [
        "Under $5,000",
        "$5,000 – $15,000",
        "$15,000 – $30,000",
        "$30,000 – $60,000",
        "$60,000+",
        "To be discussed",
      ],
    }),

    // Thank-you
    defineField({
      name: "thankYouHeading",
      title: "Thank You — Heading",
      type: "string",
      group: "thanks",
      initialValue: "Thank you. We received your note.",
    }),
    defineField({
      name: "successMessage",
      title: "Thank You — Body",
      type: "text",
      rows: 2,
      group: "thanks",
      initialValue: "We will read it with care and get back to you soon.",
    }),

    // SEO
    defineField({ name: "seoTitle", title: "SEO Title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 2, group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
