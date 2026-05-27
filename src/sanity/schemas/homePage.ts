import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

export default defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "peerBand", title: "Peer Band" },
    { name: "featured", title: "Case Studies" },
    { name: "positioning", title: "Process Lead-in" },
    { name: "fases", title: "FASES Preview" },
    { name: "about", title: "About Preview" },
    { name: "cta", title: "Final CTA" },
    { name: "seo", title: "SEO" },
    { name: "legacy", title: "Legacy", hidden: true },
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

    // Peer Band (replaces old testimonial + collaborators sections)
    defineField({
      name: "peerBandHeading",
      title: "Peer Band — Section Header",
      type: "string",
      group: "peerBand",
      initialValue: "Trusted by the people who could do it themselves.",
    }),
    defineField({
      name: "peerBandQuote",
      title: "Peer Band — Anchor Quote",
      type: "text",
      rows: 3,
      group: "peerBand",
      initialValue:
        "You overcome any obstacle that we throw at your team with the technical skills and ability to work to meet the deliverables.",
    }),
    defineField({
      name: "peerBandAuthorName",
      title: "Peer Band — Author Name",
      type: "string",
      group: "peerBand",
      initialValue: "Andrew Delgado",
    }),
    defineField({
      name: "peerBandAuthorTitle",
      title: "Peer Band — Author Title",
      type: "string",
      group: "peerBand",
      initialValue: "Technical Director of Visualization, Journey / iCrave",
    }),
    defineField({
      name: "clientMarks",
      title: "Peer Band — Client Marks",
      type: "array",
      of: [{ type: "string" }],
      group: "peerBand",
      description: "Horizontal row of client studio names.",
      initialValue: [
        "KoDA",
        "Journey / iCrave",
        "AFT",
        "Object Territories",
        "Naos",
        "Ceibo / Koqio",
      ],
    }),
    defineField({
      name: "factStrip",
      title: "Peer Band — Fact Strip",
      type: "string",
      group: "peerBand",
      description: "Small caps line beneath the client marks.",
      initialValue: "100+ projects · 12 cities · 4 continents · since 2019",
    }),

    // Hidden legacy fields — kept for back-compat, not rendered
    defineField({
      name: "testimonialQuote",
      title: "(Legacy) Testimonial Quote",
      type: "text",
      rows: 3,
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "testimonialAttribution",
      title: "(Legacy) Testimonial Attribution",
      type: "string",
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "testimonialRef",
      title: "(Legacy) Testimonial Ref",
      type: "reference",
      to: [{ type: "testimonial" }],
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "collaboratorsLabel",
      title: "(Legacy) Collaborators Eyebrow",
      type: "string",
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "collaboratorsHeading",
      title: "(Legacy) Collaborators Heading",
      type: "text",
      rows: 2,
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "collaborators",
      title: "(Legacy) Collaborators List",
      type: "array",
      group: "legacy",
      hidden: true,
      of: [
        {
          type: "object",
          name: "collaborator",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "meta", title: "City / Meta", type: "string" },
          ],
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

    // Deprecated free-text positioning statement
    defineField({
      name: "positioningStatement",
      title: "(Deprecated) Positioning Statement",
      type: "text",
      rows: 4,
      group: "legacy",
      hidden: true,
    }),
    defineField({
      name: "testimonial",
      title: "(Legacy) Testimonial Reference",
      type: "reference",
      to: [{ type: "testimonial" }],
      group: "legacy",
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
