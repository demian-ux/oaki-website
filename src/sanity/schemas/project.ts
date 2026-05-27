import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons";

export default defineType({
  name: "project",
  title: "Project Book",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "cover",     title: "Cover",     default: true },
    { name: "metadata",  title: "Metadata" },
    { name: "narrative", title: "Narrative" },
    { name: "phases",    title: "FASES" },
    { name: "seo",       title: "SEO" },
    { name: "related",   title: "Related" },
  ],
  fields: [
    // ── Cover ──────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      group: "cover",
      description: "The public title shown on the case study card and page.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "cover",
      options: { source: "title" },
      description: "URL path for this project. Auto-generated from the title.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "collectionLabel",
      title: "Collection Label",
      type: "string",
      group: "cover",
      description: "Small editorial label above the title. Example: Residential Collection.",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      group: "cover",
      description: "One-line description shown on the card and at the top of the case study page.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "cover",
      options: { hotspot: true },
      description: "Used as the book-cover image on the Case Studies page.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for accessibility and SEO.",
        }),
      ],
    }),
    defineField({
      name: "heroMedia",
      title: "Hero Media",
      type: "image",
      group: "cover",
      options: { hotspot: true },
      description: "Main image shown at the top of the case study page. Can be a still or a video poster.",
    }),

    // ── Metadata ───────────────────────────────────────────
    defineField({
      name: "projectType",
      title: "Project Type",
      type: "reference",
      group: "metadata",
      to: [{ type: "projectType" }],
    }),
    defineField({
      name: "location",
      title: "Location Reference",
      type: "reference",
      group: "metadata",
      to: [{ type: "location" }],
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "clientVisibility",
      title: "Client Visibility",
      type: "string",
      group: "metadata",
      description: "Choose Public to show the client name, Undisclosed to show a label, or Hidden to omit it.",
      options: { list: ["Public", "Undisclosed", "Hidden"], layout: "radio" },
      initialValue: "Undisclosed",
    }),
    defineField({
      name: "architect",
      title: "Architect",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "interiorDesigner",
      title: "Interior Designer",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "developer",
      title: "Developer / Client",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      group: "metadata",
      of: [{ type: "string" }],
      description: "Services Oaki provided for this project.",
    }),
    defineField({
      name: "mainGoal",
      title: "Main Goal",
      type: "string",
      group: "metadata",
      description: "What the project imagery needed to achieve. Example: sales, approval, competition, launch.",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "metadata",
      description: "Featured projects appear on the homepage and at the top of the library.",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      group: "metadata",
      description: "Lower numbers appear first. Leave blank for automatic ordering.",
    }),

    // ── Narrative ──────────────────────────────────────────
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      group: "narrative",
      rows: 3,
      description: "Optional longer description for internal use or future pages.",
    }),
    defineField({
      name: "introText",
      title: "Narrative Introduction",
      type: "text",
      group: "narrative",
      rows: 4,
      description: "The editorial opening paragraph shown at the top of the case study, after the hero.",
    }),
    defineField({
      name: "resultText",
      title: "Result Text",
      type: "text",
      group: "narrative",
      rows: 3,
      description: "What the narrative helped clarify. Shown in the result section at the bottom.",
    }),

    // ── FASES ──────────────────────────────────────────────
    defineField({
      name: "phases",
      title: "FASES",
      type: "array",
      group: "phases",
      of: [{ type: "reference", to: [{ type: "phase" }] }],
      description: "The six FASES for this project. Order: 00 The Vision → 05 The Synthesis.",
    }),

    // ── SEO ────────────────────────────────────────────────
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      description: "Overrides the default browser tab title for this project.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      group: "seo",
      rows: 2,
      description: "Meta description shown in search results. Keep under 160 characters.",
    }),
    defineField({
      name: "openGraphImage",
      title: "Open Graph Image",
      type: "image",
      group: "seo",
      description: "Image shown when this page is shared on social media.",
    }),

    // ── Related ────────────────────────────────────────────
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "reference",
      group: "related",
      to: [{ type: "testimonial" }],
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      group: "related",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "value", type: "string", title: "Value" },
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
    }),
    defineField({
      name: "relatedProjects",
      title: "Related Projects",
      type: "array",
      group: "related",
      of: [{ type: "reference", to: [{ type: "project" }] }],
    }),
  ],
  orderings: [
    { title: "Sort Order", name: "sortOrderAsc", by: [{ field: "sortOrder", direction: "asc" }] },
    { title: "Year (Newest)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Title A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      collectionLabel: "collectionLabel",
      city: "city",
      country: "country",
      year: "year",
      clientVisibility: "clientVisibility",
      featured: "featured",
      media: "coverImage",
    },
    prepare({ title, collectionLabel, city, country, year, clientVisibility, featured, media }) {
      const location = city && country ? `${city}, ${country}` : city ?? country ?? "";
      const parts = [collectionLabel, location, year, clientVisibility].filter(Boolean);
      const subtitle = (featured ? "★ Featured · " : "") + parts.join(" · ");
      return { title, subtitle, media };
    },
  },
});
