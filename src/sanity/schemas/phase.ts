import { defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons";

const LAYOUT_TYPES = [
  { title: "Fullscreen — Full-width hero image or quote", value: "Fullscreen" },
  { title: "Split Text + Image — Two-column layout", value: "Split Text Image" },
  { title: "Image Grid — Multi-image grid", value: "Image Grid" },
  { title: "Horizontal Gallery — Side-scroll strip", value: "Horizontal Gallery" },
  { title: "Pinned Scroll — Sticky content with scroll", value: "Pinned Scroll" },
  { title: "Quote — Large editorial quote", value: "Quote" },
  { title: "Material Study — Material macro grid", value: "Material Study" },
  { title: "Contact Sheet — Dense image index", value: "Contact Sheet" },
  { title: "Video — Video section", value: "Video" },
];

export default defineType({
  name: "phase",
  title: "FASE",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "phaseNumber",
      title: "Phase Number",
      type: "string",
      description: "00 through 05. Must match the FASES method.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "phaseTitle",
      title: "Phase Title",
      type: "string",
      description: "Example: The Vision, The Spirit, The Human Trace.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "layoutType",
      title: "Layout Type",
      type: "string",
      description: "Controls how this FASE appears on the case study page.",
      options: { list: LAYOUT_TYPES, layout: "radio" },
      initialValue: "Fullscreen",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Internal description of what this phase covers.",
    }),
    defineField({
      name: "whatItIs",
      title: "What It Is",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "whatItContains",
      title: "What It Contains",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "introText",
      title: "Intro Text",
      type: "text",
      rows: 3,
      description: "Editorial text shown at the start of this section.",
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "string",
      description: "Large editorial quote. Used in Fullscreen and Quote layout types.",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt Text" }],
        },
      ],
    }),
    defineField({
      name: "video",
      title: "Video URL",
      type: "url",
      description: "Mux or external video URL for the Video layout type.",
    }),
    defineField({
      name: "materials",
      title: "Materials",
      type: "array",
      of: [{ type: "string" }],
      description: "Material names for captions. Example: Travertine, Brushed Brass.",
    }),
    defineField({
      name: "colorPalette",
      title: "Color Palette",
      type: "array",
      of: [{ type: "string" }],
      description: "Hex values for the project palette. Example: #f4f2ee.",
    }),
  ],
  preview: {
    select: {
      phaseNumber: "phaseNumber",
      phaseTitle: "phaseTitle",
      layoutType: "layoutType",
      media: "mainImage",
    },
    prepare({ phaseNumber, phaseTitle, layoutType, media }) {
      return {
        title: `FASE ${phaseNumber} — ${phaseTitle?.toUpperCase()}`,
        subtitle: layoutType,
        media,
      };
    },
  },
});
