import { type StructureResolver } from "sanity/structure";
import {
  BookIcon,
  HomeIcon,
  OlistIcon,
  UsersIcon,
  EnvelopeIcon,
  CogIcon,
  DocumentsIcon,
  StarIcon,
  PinIcon,
} from "@sanity/icons";

// Singleton document IDs — one document per page type
export const SINGLETON_IDS: Record<string, string> = {
  homePage:    "singleton-homePage",
  processPage: "singleton-processPage",
  aboutPage:   "singleton-aboutPage",
  contactPage: "singleton-contactPage",
  siteSettings: "singleton-siteSettings",
};

// Types excluded from the default "All documents" list
export const HIDDEN_DOCUMENT_TYPES = [
  "homePage",
  "processPage",
  "aboutPage",
  "contactPage",
  "siteSettings",
  "media.tag",
];

const PROJECT_TYPES = [
  "Residential",
  "Hospitality",
  "Education",
  "Cultural",
  "Commercial",
  "Competition",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Oaki Studio")
    .items([
      // ── Project Books ──────────────────────────────────
      S.listItem()
        .title("Project Books")
        .icon(BookIcon)
        .child(
          S.list()
            .title("Project Books")
            .items([
              S.documentTypeListItem("project")
                .title("All Project Books")
                .icon(DocumentsIcon),

              S.listItem()
                .title("Featured")
                .icon(StarIcon)
                .child(
                  S.documentList()
                    .title("Featured Projects")
                    .schemaType("project")
                    .filter('_type == "project" && featured == true')
                ),

              S.divider(),

              ...PROJECT_TYPES.map((type) =>
                S.listItem()
                  .title(type)
                  .child(
                    S.documentList()
                      .title(`${type} Projects`)
                      .schemaType("project")
                      .filter(
                        '_type == "project" && projectType->title == $type'
                      )
                      .params({ type })
                  )
              ),
            ])
        ),

      S.divider(),

      // ── Pages ──────────────────────────────────────────
      S.listItem()
        .title("Pages")
        .icon(PinIcon)
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .title("Home")
                .icon(HomeIcon)
                .child(
                  S.document()
                    .schemaType("homePage")
                    .documentId(SINGLETON_IDS.homePage)
                    .title("Home")
                ),
              S.listItem()
                .title("Process")
                .icon(OlistIcon)
                .child(
                  S.document()
                    .schemaType("processPage")
                    .documentId(SINGLETON_IDS.processPage)
                    .title("Process")
                ),
              S.listItem()
                .title("About")
                .icon(UsersIcon)
                .child(
                  S.document()
                    .schemaType("aboutPage")
                    .documentId(SINGLETON_IDS.aboutPage)
                    .title("About")
                ),
              S.listItem()
                .title("Contact")
                .icon(EnvelopeIcon)
                .child(
                  S.document()
                    .schemaType("contactPage")
                    .documentId(SINGLETON_IDS.contactPage)
                    .title("Contact")
                ),
            ])
        ),

      S.divider(),

      // ── Journal ────────────────────────────────────────
      S.listItem()
        .title("Journal")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Journal")
            .items([
              S.documentTypeListItem("journalPost").title("All Posts"),
              S.listItem()
                .title("Published")
                .child(
                  S.documentList()
                    .title("Published Posts")
                    .schemaType("journalPost")
                    .filter('_type == "journalPost" && published == true')
                ),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentList()
                    .title("Draft Posts")
                    .schemaType("journalPost")
                    .filter(
                      '_type == "journalPost" && (published != true || !defined(published))'
                    )
                ),
            ])
        ),

      S.divider(),

      // ── People ─────────────────────────────────────────
      S.listItem()
        .title("People")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("People")
            .items([
              S.documentTypeListItem("teamMember").title("Team"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
            ])
        ),

      S.divider(),

      // ── Business ───────────────────────────────────────
      S.listItem()
        .title("Business")
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title("Business")
            .items([
              S.documentTypeListItem("formSubmission")
                .title("Form Submissions"),
              S.documentTypeListItem("projectType")
                .title("Project Types"),
              S.documentTypeListItem("location")
                .title("Locations"),
            ])
        ),

      S.divider(),

      // ── Settings ───────────────────────────────────────
      S.listItem()
        .title("Settings")
        .icon(CogIcon)
        .child(
          S.list()
            .title("Settings")
            .items([
              S.listItem()
                .title("Site Settings")
                .icon(CogIcon)
                .child(
                  S.document()
                    .schemaType("siteSettings")
                    .documentId(SINGLETON_IDS.siteSettings)
                    .title("Site Settings")
                ),
            ])
        ),
    ]);
