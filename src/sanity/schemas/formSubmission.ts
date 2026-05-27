import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons";

export default defineType({
  name: "formSubmission",
  title: "Form Submission",
  type: "document",
  icon: EnvelopeIcon,
  // Submissions are created by the server only — editors can update status
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["New", "Reviewed", "Replied", "Archived"], layout: "radio" },
      initialValue: "New",
      description: "Track where this inquiry stands.",
    }),
    defineField({ name: "name",            title: "Name",             type: "string",   readOnly: true }),
    defineField({ name: "email",           title: "Email",            type: "string",   readOnly: true }),
    defineField({ name: "company",         title: "Company",          type: "string",   readOnly: true }),
    defineField({ name: "role",            title: "Role",             type: "string",   readOnly: true }),
    defineField({ name: "website",         title: "Website",          type: "url",      readOnly: true }),
    defineField({ name: "projectName",     title: "Project Name",     type: "string",   readOnly: true }),
    defineField({ name: "projectLocation", title: "Project Location", type: "string",   readOnly: true }),
    defineField({ name: "projectType",     title: "Project Type",     type: "string",   readOnly: true }),
    defineField({ name: "projectStage",    title: "Project Stage",    type: "string",   readOnly: true }),
    defineField({ name: "servicesNeeded",  title: "Services Needed",  type: "array", of: [{ type: "string" }], readOnly: true }),
    defineField({ name: "mainGoal",        title: "Main Goal",        type: "array", of: [{ type: "string" }], readOnly: true }),
    defineField({ name: "timeline",        title: "Timeline",         type: "string",   readOnly: true }),
    defineField({ name: "estimatedImages", title: "Estimated Images", type: "string",   readOnly: true }),
    defineField({ name: "videoNeeds",      title: "Video Needs",      type: "string",   readOnly: true }),
    defineField({ name: "budgetRange",     title: "Budget Range",     type: "string",   readOnly: true }),
    defineField({ name: "message",         title: "Message",          type: "text", rows: 6, readOnly: true }),
    defineField({ name: "createdAt",       title: "Received",         type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Newest First", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
    { title: "Status", name: "statusAsc", by: [{ field: "status", direction: "asc" }] },
  ],
  preview: {
    select: {
      name: "name",
      projectName: "projectName",
      company: "company",
      email: "email",
      createdAt: "createdAt",
      status: "status",
    },
    prepare({ name, projectName, company, email, createdAt, status }) {
      const date = createdAt ? new Date(createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
      const subtitle = [name, email, date, status].filter(Boolean).join(" · ");
      return {
        title: projectName || company || name || "Unnamed inquiry",
        subtitle,
      };
    },
  },
});
