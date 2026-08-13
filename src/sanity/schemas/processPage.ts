import { defineField, defineType } from "sanity";
import { OlistIcon } from "@sanity/icons";

export default defineType({
  name: "processPage",
  title: "Process",
  type: "document",
  icon: OlistIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "steps", title: "Steps" },
    { name: "fases", title: "FASES Method" },
    { name: "cta", title: "CTA" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Hero
    defineField({
      name: "heroLabel",
      title: "Hero — Eyebrow",
      type: "string",
      group: "hero",
      initialValue: "How we work",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — Headline",
      type: "string",
      group: "hero",
      initialValue: "Our process starts before the image.",
    }),
    defineField({
      name: "heroText",
      title: "Hero — Subtext",
      type: "text",
      rows: 2,
      group: "hero",
      initialValue:
        "We read the project, find its tone, and build the image world that lets others see what you see.",
    }),

    // Steps
    defineField({
      name: "steps",
      title: "Process Steps",
      type: "array",
      group: "steps",
      of: [
        {
          type: "object",
          name: "processStep",
          fields: [
            { name: "number", title: "Number", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 3 },
          ],
          preview: {
            select: { number: "number", title: "title" },
            prepare: ({ number, title }) => ({ title: `${number} · ${title}` }),
          },
        },
      ],
      initialValue: [
        {
          number: "01",
          title: "Read the project",
          body: "We study the brief, the site, the audience, and what the project is trying to prove. We ask the questions the images will have to answer.",
        },
        {
          number: "02",
          title: "Find the narrative",
          body: "We define the feeling. What should someone experience when they first see this project? That answer drives every image we make.",
        },
        {
          number: "03",
          title: "Build the visual language",
          body: "We build the reference world: mood, material, light, color, rhythm. The complete atmosphere of the project before a single frame is rendered.",
        },
        {
          number: "04",
          title: "Craft the image sequence",
          body: "We create every view, detail, and moment that tells the story. Nothing is generic. Nothing is accidental.",
        },
        {
          number: "05",
          title: "Prepare the project for use",
          body: "We deliver images built to work. For your pitch deck. Your sales launch. Your competition submission. Not just a folder of files.",
        },
      ],
    }),

    // FASES
    defineField({
      name: "fasesLabel",
      title: "FASES — Eyebrow",
      type: "string",
      group: "fases",
      initialValue: "The Phases Method",
    }),
    defineField({
      name: "fasesHeading",
      title: "FASES — Heading",
      type: "text",
      rows: 2,
      group: "fases",
      initialValue: "Every project book follows the same six-part structure.",
    }),

    // CTA
    defineField({
      name: "ctaHeading",
      title: "CTA — Heading",
      type: "string",
      group: "cta",
      initialValue: "Your images need to do a job.",
    }),
    defineField({
      name: "ctaBody",
      title: "CTA — Body",
      type: "string",
      group: "cta",
      initialValue: "Let us figure out what it is.",
    }),
    defineField({
      name: "ctaButtonLabel",
      title: "CTA — Button",
      type: "string",
      group: "cta",
      initialValue: "Start a project",
    }),

    // SEO
    defineField({ name: "seoTitle", title: "SEO Title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 2, group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Process Page" }) },
});
