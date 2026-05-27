import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Full Quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "shortQuote", title: "Short Quote", type: "text", rows: 2 }),
    defineField({ name: "personName", title: "Person Name", type: "string" }),
    defineField({ name: "personTitle", title: "Person Title", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({ name: "project", title: "Project", type: "reference", to: [{ type: "project" }] }),
    defineField({ name: "displayName", title: "Display Name", type: "string" }),
    defineField({ name: "approved", title: "Approved", type: "boolean", initialValue: false }),
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: { list: ["Classy", "Emotional", "Strategic", "Quiet"] },
    }),
  ],
  preview: { select: { title: "personName", subtitle: "company" } },
});
