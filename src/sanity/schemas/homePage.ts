import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

export default defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "featured", title: "Featured Books" },
    { name: "positioning", title: "Positioning" },
    { name: "fases", title: "FASES Preview" },
    { name: "testimonial", title: "Testimonial" },
    { name: "collaborators", title: "Collaborators" },
    { name: "about", title: "About Preview" },
    { name: "cta", title: "Final CTA" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Hero
    defineField({
      name: "heroLabel",
      title: "Hero — Eyebrow Label",
      type: "string",
      group: "hero",
      initialValue: "Architectural Storytelling Studio",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — Headline",
      type: "string",
      group: "hero",
      description: "Main H1, animated as typewriter.",
      initialValue: "Your project, told the way Phaidon would publish it.",
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero — Subtext",
      type: "text",
      rows: 3,
      group: "hero",
      initialValue:
        "We work with architects, interior designers, and developers across New York and Europe. We reply within two hours. We deliver on time. Every time.",
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Hero — Primary Button",
      type: "string",
      group: "hero",
      initialValue: "Begin the conversation",
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Hero — Secondary Button",
      type: "string",
      group: "hero",
      initialValue: "View Case Studies",
    }),

    // Featured
    defineField({
      name: "featuredLabel",
      title: "Featured — Eyebrow",
      type: "string",
      group: "featured",
      initialValue: "Selected Project Books",
    }),
    defineField({
      name: "featuredHeading",
      title: "Featured — Heading",
      type: "text",
      rows: 2,
      group: "featured",
      initialValue: "Each project is a complete story, not a folder of renders.",
    }),
    defineField({
      name: "featuredViewAllLabel",
      title: "Featured — Library Link",
      type: "string",
      group: "featured",
      initialValue: "View the Library →",
    }),

    // Positioning
    defineField({
      name: "positioningHeading",
      title: "Positioning — Heading",
      type: "text",
      rows: 2,
      group: "positioning",
      initialValue: "Most studios start with the image. We start with the story.",
    }),
    defineField({
      name: "positioningParagraph1",
      title: "Positioning — First Paragraph",
      type: "text",
      rows: 3,
      group: "positioning",
      initialValue:
        "Our role is to read the project, find its tone, and build the visual world that makes others want to be part of it before the first brick is laid.",
    }),
    defineField({
      name: "positioningParagraph2",
      title: "Positioning — Second Paragraph",
      type: "text",
      rows: 2,
      group: "positioning",
      initialValue: "For sales. For approval. For competitions. For memory.",
    }),

    // FASES
    defineField({
      name: "fasesLabel",
      title: "FASES — Eyebrow",
      type: "string",
      group: "fases",
      initialValue: "Before we make a single image, we build the story.",
    }),
    defineField({
      name: "fasesButtonLabel",
      title: "FASES — Button",
      type: "string",
      group: "fases",
      initialValue: "See the full process",
    }),

    // Testimonial
    defineField({
      name: "testimonialQuote",
      title: "Testimonial — Quote",
      type: "text",
      rows: 3,
      group: "testimonial",
      initialValue:
        "Oaki helped us find the tone of the project before a single final image was made.",
    }),
    defineField({
      name: "testimonialAttribution",
      title: "Testimonial — Attribution",
      type: "string",
      group: "testimonial",
      initialValue: "Creative Director, Undisclosed Studio",
    }),
    defineField({
      name: "testimonialRef",
      title: "Or: Referenced Testimonial",
      type: "reference",
      to: [{ type: "testimonial" }],
      group: "testimonial",
      description: "If set, overrides the inline quote/attribution above.",
    }),

    // Collaborators
    defineField({
      name: "collaboratorsLabel",
      title: "Collaborators — Eyebrow",
      type: "string",
      group: "collaborators",
      initialValue: "Selected Collaborators",
    }),
    defineField({
      name: "collaboratorsHeading",
      title: "Collaborators — Heading",
      type: "text",
      rows: 2,
      group: "collaborators",
      initialValue:
        "We publish for studios who want their projects read closely.",
    }),
    defineField({
      name: "collaborators",
      title: "Collaborators — List",
      type: "array",
      group: "collaborators",
      of: [
        {
          type: "object",
          name: "collaborator",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "meta", title: "City / Meta", type: "string" },
          ],
          preview: {
            select: { title: "name", subtitle: "meta" },
          },
        },
      ],
    }),

    // About Preview
    defineField({
      name: "aboutLabel",
      title: "About Preview — Eyebrow",
      type: "string",
      group: "about",
      initialValue: "About the Studio",
    }),
    defineField({
      name: "aboutHeading",
      title: "About Preview — Heading",
      type: "text",
      rows: 2,
      group: "about",
      initialValue: "A boutique team. A Phaidon standard.",
    }),
    defineField({
      name: "aboutBody",
      title: "About Preview — Body",
      type: "text",
      rows: 3,
      group: "about",
      initialValue:
        "Small enough to know every detail of your project. Skilled enough to make it look like a museum commission.",
    }),
    defineField({
      name: "aboutButtonLabel",
      title: "About Preview — Button",
      type: "string",
      group: "about",
      initialValue: "About the Studio",
    }),

    // Final CTA
    defineField({
      name: "finalCtaHeading",
      title: "Final CTA — Heading",
      type: "text",
      rows: 2,
      group: "cta",
      initialValue: "Tell us what you are building.",
    }),
    defineField({
      name: "finalCtaButtonLabel",
      title: "Final CTA — Button",
      type: "string",
      group: "cta",
      initialValue: "Begin the conversation",
    }),

    // Legacy field kept for back-compat
    defineField({
      name: "positioningStatement",
      title: "(Deprecated) Positioning Statement",
      type: "text",
      rows: 4,
      group: "positioning",
      description: "Legacy field — use Positioning fields above.",
      hidden: true,
    }),
    defineField({
      name: "testimonial",
      title: "(Deprecated) Testimonial Ref",
      type: "reference",
      to: [{ type: "testimonial" }],
      group: "testimonial",
      hidden: true,
    }),

    // SEO
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
    defineField({
      name: "openGraphImage",
      title: "Open Graph Image",
      type: "image",
      group: "seo",
    }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
