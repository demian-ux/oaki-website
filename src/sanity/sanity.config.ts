import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool, defineLocations } from "sanity/presentation";
import { sanityConfig } from "./config";
import { schemaTypes } from "./schemas";
import { structure, HIDDEN_DOCUMENT_TYPES, SINGLETON_IDS } from "./structure";
import { oakiTheme } from "./theme";

const siteUrl =
  typeof window !== "undefined"
    ? window.location.origin.includes("localhost")
      ? "http://localhost:3001"
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export default defineConfig({
  ...sanityConfig,
  name: "oaki-studio",
  title: "Oaki Studio",
  theme: oakiTheme,

  plugins: [
    // Presentation FIRST so visiting /studio lands in the visual editor
    // (Framer-style click-to-edit) instead of the schema browser.
    presentationTool({
      title: "Editor",
      previewUrl: {
        origin: siteUrl,
        preview: "/",
        draftMode: {
          enable: `/api/draft?secret=${process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET ?? "oaki-preview-local"}`,
        },
      },
      resolve: {
        locations: {
          project: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title ?? "Untitled Project",
                  href: `/case-studies/${doc?.slug}`,
                },
                {
                  title: "Case Studies Library",
                  href: "/case-studies",
                },
              ],
            }),
          }),

          journalPost: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title ?? "Untitled Post",
                  href: `/journal/${doc?.slug}`,
                },
              ],
            }),
          }),

          homePage: defineLocations({
            select: { title: "title" },
            resolve: () => ({
              locations: [{ title: "Home", href: "/" }],
            }),
          }),

          processPage: defineLocations({
            select: { title: "title" },
            resolve: () => ({
              locations: [{ title: "Process", href: "/process" }],
            }),
          }),

          aboutPage: defineLocations({
            select: { title: "title" },
            resolve: () => ({
              locations: [{ title: "About", href: "/about" }],
            }),
          }),

          contactPage: defineLocations({
            select: { title: "title" },
            resolve: () => ({
              locations: [{ title: "Contact", href: "/contact" }],
            }),
          }),

          siteSettings: defineLocations({
            select: { title: "title" },
            resolve: () => ({
              locations: [
                { title: "Home", href: "/" },
                { title: "Case Studies", href: "/case-studies" },
              ],
            }),
          }),
        },
      },
    }),

    // Structure ("Content") as a secondary tab for power-users who want
    // the schema browser. Most editing happens in the Editor tab.
    structureTool({
      title: "Content",
      structure,
    }),

    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singleton types from the "New document" menu
    templates: (templates) =>
      templates.filter(
        ({ schemaType }) =>
          !Object.keys(SINGLETON_IDS).includes(schemaType) &&
          !HIDDEN_DOCUMENT_TYPES.includes(schemaType)
      ),
  },

  document: {
    // Hide the "Create new" button for singleton types
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (template) => !Object.keys(SINGLETON_IDS).includes(template.templateId)
        );
      }
      return prev;
    },
    // Disable "Delete" for singletons
    actions: (prev, { schemaType }) => {
      if (Object.keys(SINGLETON_IDS).includes(schemaType)) {
        return prev.filter(({ action }) => action !== "delete");
      }
      return prev;
    },
  },
});
