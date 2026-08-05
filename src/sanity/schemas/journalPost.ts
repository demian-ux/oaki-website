import { defineField, defineType } from "sanity";
import { ComposeIcon } from "@sanity/icons";

// Journal categories are a closed vocabulary so the tag pill on the slider and
// cards stays consistent. "News" is the home for project-news pieces; the rest
// are the essay lanes. Extending the list is a one-line edit here.
export const JOURNAL_CATEGORIES = [
  "News",
  "Craft",
  "Film",
  "Material",
  "Process",
  "Stills",
] as const;

export default defineType({
  name: "journalPost",
  title: "Journal Post",
  type: "document",
  icon: ComposeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "publishing", title: "Publishing" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "The entry title, sentence case. Shown on the homepage slider, the journal index, and the entry page.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "The URL of the entry: /journal/<slug>. Generate it from the title and leave it alone once published.",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      description: "The tag shown on the entry card. News = pieces about a project; the others are essay lanes.",
      options: { list: [...JOURNAL_CATEGORIES], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dek",
      title: "Dek",
      type: "text",
      rows: 2,
      group: "content",
      description: "One sentence under the headline: what the project is and where. Part of the journal news format.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 2,
      group: "content",
      description: "One or two sentences. Used on the journal index and as the SEO description fallback.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "content",
      description: "The entry's lead image. Renders are shown at their natural ratio, never cropped, so upload the final frame.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt Text" })],
    }),
    defineField({
      name: "heroNote",
      title: "Hero Note",
      type: "string",
      group: "content",
      description: "Which render is meant to be the hero, while the image is pending. Shown as the placeholder label on private previews; never shown once a cover image exists.",
    }),
    defineField({
      name: "credits",
      title: "Credit Block",
      type: "array",
      group: "content",
      description: "The fixed-format credit block at the end of the article: Architect / Client / Location / Year / oaki produced. Rendered in order.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", title: "Label", validation: (r) => r.required() }),
            defineField({ name: "value", type: "string", title: "Value", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    defineField({
      name: "sourceLinks",
      title: "Source Line",
      type: "array",
      group: "content",
      description: "Links to the primary sources (award page, article, sale record). At least one makes it journalism.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", title: "Label", validation: (r) => r.required() }),
            defineField({ name: "url", type: "url", title: "URL", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      description: "The article. Paragraphs, two heading levels, pull-quotes, and full-width images.",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string", title: "Alt Text" })],
        },
      ],
    }),
    defineField({
      name: "project",
      title: "Related Project",
      type: "reference",
      group: "content",
      description: "For News pieces: the project this entry is about. Adds a link to its case study on the entry page.",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "publishing",
      description: "Who wrote it. Shown at the end of the entry.",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      group: "publishing",
      description: "Publication date. Entries are ordered newest first; shown as month and year (e.g. Jul 2026).",
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      description: "Only ticked entries appear on the site. Tip: tick this on a draft to see it in the Presentation preview before publishing the document.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      description: "Browser-tab / search-result title. Falls back to the entry title.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      group: "seo",
      description: "Search-result description. Falls back to the excerpt.",
    }),
  ],
  orderings: [
    {
      title: "Date, newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", category: "category", date: "date", media: "coverImage" },
    prepare({ title, category, date, media }) {
      return {
        title,
        subtitle: [category, date].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
