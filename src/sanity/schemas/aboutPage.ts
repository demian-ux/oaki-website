import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons";

export default defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  icon: UsersIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "statement", title: "Statement" },
    { name: "team", title: "Team" },
    { name: "workWith", title: "We Work With" },
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
      initialValue: "About the Studio",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — Headline",
      type: "string",
      group: "hero",
      initialValue:
        "We build the image world around architecture that doesn't exist yet.",
    }),
    defineField({
      name: "heroText",
      title: "Hero — Subtext",
      type: "text",
      rows: 3,
      group: "hero",
      initialValue:
        "Oaki Studio works with architects, designers, and developers to make projects feel real before they are.",
    }),

    // Statement
    defineField({
      name: "statementHeading",
      title: "Statement — Heading",
      type: "text",
      rows: 2,
      group: "statement",
      initialValue: "A building can be correct and still fail to move anyone.",
    }),
    defineField({
      name: "statementParagraph1",
      title: "Statement — First Paragraph",
      type: "text",
      rows: 3,
      group: "statement",
      initialValue:
        "We close that gap. Our work makes people want to live in a project before the first brick is laid.",
    }),
    defineField({
      name: "statementParagraph2",
      title: "Statement — Second Paragraph",
      type: "text",
      rows: 3,
      group: "statement",
      initialValue:
        "Most studios run like render factories. We run like an editorial house. Every project gets a story, a tone, and an image world built around it.",
    }),

    // Team
    defineField({
      name: "teamLabel",
      title: "Team — Eyebrow",
      type: "string",
      group: "team",
      initialValue: "The team",
    }),

    // We Work With
    defineField({
      name: "workWithLabel",
      title: "We Work With — Eyebrow",
      type: "string",
      group: "workWith",
      initialValue: "We work with",
    }),
    defineField({
      name: "workWithItems",
      title: "We Work With — Items",
      type: "array",
      of: [{ type: "string" }],
      group: "workWith",
      initialValue: [
        "Luxury Residential Architects",
        "Interior Designers",
        "Hospitality Architects",
        "Developers",
      ],
    }),

    // CTA
    defineField({
      name: "ctaHeading",
      title: "CTA — Heading",
      type: "text",
      rows: 2,
      group: "cta",
      initialValue: "Tell us what you are building.",
    }),
    defineField({
      name: "ctaButtonLabel",
      title: "CTA — Button",
      type: "string",
      group: "cta",
      initialValue: "Begin the conversation",
    }),

    // Legacy
    defineField({
      name: "studioStatement",
      title: "(Deprecated) Studio Statement",
      type: "text",
      rows: 3,
      group: "statement",
      hidden: true,
    }),
    defineField({
      name: "studioText",
      title: "(Deprecated) Studio Text",
      type: "text",
      rows: 5,
      group: "statement",
      hidden: true,
    }),

    // SEO
    defineField({ name: "seoTitle", title: "SEO Title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 2, group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
