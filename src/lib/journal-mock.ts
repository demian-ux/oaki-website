// Mock journal articles for the homepage "From the Journal" section.
// Placeholder content + local images so the section renders before the journal
// launches. The Sanity-backed path lives in data.ts (getJournalPosts); these
// mocks are its no-CMS fallback, mirroring placeholder-data.ts for projects.
import type { JournalPost } from "./types";
import type { PortableTextBlock } from "@portabletext/react";

export type JournalArticle = {
  slug: string;
  category: string; // short label shown as the tag, e.g. "Craft"
  title: string;
  excerpt: string;
  date: string; // display date, e.g. "Jun 2026"
  readMins: number;
  img: string;
};

export const journalArticlesMock: JournalArticle[] = [
  {
    slug: "why-we-model-the-light-first",
    category: "Craft",
    title: "Why we model the light first",
    excerpt:
      "Before geometry, before material, we build the light. It decides what the room feels like long before anyone reads the plan.",
    date: "Jun 2026",
    readMins: 4,
    img: "/images/journal-craft-light.jpg",
  },
  {
    slug: "the-case-against-the-flythrough",
    category: "Film",
    title: "The case against the flythrough",
    excerpt:
      "A camera that never stops moving never lets you arrive. We make films with a beginning, a middle, and a reason to stay.",
    date: "May 2026",
    readMins: 6,
    img: "/images/journal-film-flythrough.jpg",
  },
  {
    slug: "what-concrete-wants-to-be",
    category: "Material",
    title: "What concrete wants to be",
    excerpt:
      "Every material has a way it likes to catch light. Render the honest version and the image stops looking rendered.",
    date: "Apr 2026",
    readMins: 5,
    img: "/images/journal-material-concrete.jpg",
  },
  {
    slug: "the-work-before-the-work",
    category: "Process",
    title: "The work before the work",
    excerpt:
      "The decisions that carry a project happen in the quiet weeks nobody sees. Here is what that week actually looks like.",
    date: "Mar 2026",
    readMins: 7,
    img: "/images/journal-process-work.jpg",
  },
  {
    slug: "an-image-you-look-at-twice",
    category: "Stills",
    title: "An image you look at twice",
    excerpt:
      "A still has one job, to be looked at again. We talk about what separates the frame people scroll past from the one they keep.",
    date: "Feb 2026",
    readMins: 3,
    img: "/images/journal-stills-image.jpg",
  },
];

// ── JournalPost-shaped mocks ─────────────────────────────────────────────
// The same 5 entries in the Sanity shape, so the journal pages render in a
// no-CMS environment. Bodies are the excerpts as a single paragraph — enough
// to exercise the template, obviously placeholder in review.

const isoDates: Record<string, string> = {
  "why-we-model-the-light-first": "2026-06-15",
  "the-case-against-the-flythrough": "2026-05-15",
  "what-concrete-wants-to-be": "2026-04-15",
  "the-work-before-the-work": "2026-03-15",
  "an-image-you-look-at-twice": "2026-02-15",
};

function paragraph(text: string, key: string): PortableTextBlock {
  return {
    _type: "block",
    _key: `${key}-p1`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}-s1`, text, marks: [] }],
  };
}

export const journalPostsMock: JournalPost[] = journalArticlesMock.map((a) => ({
  _id: `journalPost-${a.slug}`,
  title: a.title,
  slug: a.slug,
  category: a.category,
  excerpt: a.excerpt,
  coverImage: null,
  img: a.img,
  author: null,
  date: isoDates[a.slug],
  readMins: a.readMins,
  body: [paragraph(a.excerpt, a.slug)],
  project: null,
}));
