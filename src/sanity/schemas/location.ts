import { defineField, defineType } from "sanity";

export default defineType({
  name: "location",
  title: "Location",
  type: "document",
  fields: [
    defineField({ name: "city", title: "City", type: "string", validation: (r) => r.required() }),
    defineField({ name: "country", title: "Country", type: "string" }),
    defineField({ name: "region", title: "Region", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "city" } }),
  ],
  preview: { select: { title: "city", subtitle: "country" } },
});
