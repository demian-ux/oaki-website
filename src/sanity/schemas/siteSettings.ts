import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand" },
    { name: "preloader", title: "Preloader" },
    { name: "nav", title: "Navigation" },
    { name: "footer", title: "Footer" },
    { name: "seo", title: "Default SEO" },
    { name: "config", title: "Configuration" },
  ],
  fields: [
    defineField({ name: "logo", title: "Logo", type: "image", group: "brand" }),
    defineField({
      name: "studioTagline",
      title: "Studio Tagline",
      type: "string",
      group: "brand",
      description: "Used in the footer below the logotype.",
      initialValue: "Stories for architecture that doesn't exist yet.",
    }),

    // Preloader
    defineField({
      name: "preloaderText",
      title: "Preloader — Coordinate Line",
      type: "string",
      group: "preloader",
      description:
        "The system/coordinate line typed out below the animated mark during page load. Renders UPPERCASE in Neue Montreal, ocre-700. Write it as a coordinate (locations, counts, scales, separated by ·).",
      initialValue: "100% computer-generated · Oaki Studio · Buenos Aires",
    }),

    // Navigation
    defineField({
      name: "headerCtaLabel",
      title: "Header CTA Button Label",
      type: "string",
      group: "nav",
      initialValue: "Start a project",
    }),
    defineField({
      name: "navLabels",
      title: "Nav Link Labels (in order)",
      type: "object",
      group: "nav",
      fields: [
        { name: "caseStudies", title: "Case Studies", type: "string", initialValue: "Case Studies" },
        { name: "process", title: "Process", type: "string", initialValue: "Process" },
        { name: "about", title: "About", type: "string", initialValue: "About" },
        { name: "contact", title: "Contact", type: "string", initialValue: "Contact" },
      ],
    }),

    // Footer
    defineField({
      name: "footerCopyright",
      title: "Footer — Copyright Suffix",
      type: "string",
      group: "footer",
      description: "Appears after the year, e.g. \"All rights reserved.\"",
      initialValue: "All rights reserved.",
    }),
    defineField({
      name: "footerCities",
      title: "Footer — Cities Line",
      type: "string",
      group: "footer",
      initialValue: "Buenos Aires · New York",
    }),

    // Default SEO
    defineField({ name: "defaultSeoTitle", title: "Default SEO Title", type: "string", group: "seo" }),
    defineField({ name: "defaultSeoDescription", title: "Default SEO Description", type: "text", rows: 2, group: "seo" }),

    // Config
    defineField({ name: "contactEmail", title: "Contact Email", type: "string", group: "config" }),
    defineField({ name: "showJournal", title: "Show Journal in Navigation", type: "boolean", initialValue: false, group: "config" }),
    defineField({ name: "showClientNames", title: "Show Client Names", type: "boolean", initialValue: false, group: "config" }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      group: "config",
      fields: [
        { name: "instagram", title: "Instagram URL", type: "url" },
        { name: "linkedin", title: "LinkedIn URL", type: "url" },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
