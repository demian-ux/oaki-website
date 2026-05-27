import { defineField, defineType } from "sanity";

export default defineType({
  name: "projectType",
  title: "Project Type",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "title" } },
});
