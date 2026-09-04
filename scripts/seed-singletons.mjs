#!/usr/bin/env node
/**
 * Seed the four page singletons + siteSettings in Sanity with their
 * default copy. Idempotent — uses `createOrReplace` so re-running it
 * resets the docs to defaults. Safe to run multiple times.
 *
 * Usage:  node scripts/seed-singletons.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

// Manually parse .env.local — avoids adding a runtime dep
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let [, key, val] = m;
      // Strip surrounding quotes if present
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch (e) {
    console.error("Could not read .env.local at", envPath);
    throw e;
  }
  return env;
}

const env = loadEnv();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

// ── Documents to seed ─────────────────────────────────────
const docs = [
  {
    _id: "singleton-homePage",
    _type: "homePage",
    // Hero — single editorial line per design critique (May 2026)
    heroLabel: "A studio building architectural narratives",
    heroTitle: "Made for the pitch, the board, and the jury.",
    heroSubtext:
      "Animation, stills, and film composed as one story, not a folder of jpegs.",
    heroPrimaryCta: "Start a project",
    heroSecondaryCta: "See the case studies",
    // Case Studies
    featuredLabel: "Case studies",
    featuredHeading: "Each one a book of its own.",
    featuredViewAllLabel: "View the Library →",
    // Process lead-in
    positioningHeading: "Most studios start with a rough draft. We start with the story.",
    positioningParagraph1:
      "Our role is to understand the project, find its tone, and build the visual world that makes others want to be part of it before the first brick is laid.",
    positioningParagraph2: "", // intentionally empty — old pulse line removed
    // FASES transition line
    fasesLabel: "Before we open 3ds Max, we ask questions to define:",
    fasesButtonLabel: "See the full process",
    // Peer Band (replaces old testimonial + collaborators)
    peerBandHeading: "Trusted by the people who could do it themselves.",
    peerBandQuote:
      "You overcome any obstacle that we throw at your team with the technical skills and ability to work to meet the deliverables.",
    peerBandAuthorName: "Andrew Delgado",
    peerBandAuthorTitle: "Technical Director of Visualization, Journey / iCrave",
    clientMarks: [
      "Koda",
      "Journey / iCrave",
      "AFT",
      "Object Territories",
      "Naos",
      "Ceibo / Koqio",
    ],
    factStrip: "100+ projects · 12 cities · 4 continents · since 2019",
    // Clear legacy fields so they don't haunt the data
    testimonialQuote: "",
    testimonialAttribution: "",
    collaboratorsLabel: "",
    collaboratorsHeading: "",
    collaborators: [],
    // About Preview
    aboutLabel: "About the studio",
    aboutHeading: "The same team on every project.",
    aboutBody:
      "Principals on every brief. The people you meet are the people doing the work.",
    aboutButtonLabel: "About the Studio",
    // Final CTA
    finalCtaHeading: "Tell us what you are building.",
    finalCtaButtonLabel: "Start a project",
    // SEO
    seoTitle: "oaki.studio | A studio building architectural narratives",
    seoDescription:
      "Architectural narrative studio. 100+ projects across 12 cities and 4 continents. Animation, stills, and film for the pitch, the board, and the jury.",
  },
  {
    _id: "singleton-aboutPage",
    _type: "aboutPage",
    heroLabel: "About the Studio",
    heroTitle:
      "We build the image world around architecture that doesn't exist yet.",
    heroText:
      "Oaki Studio works with architects, designers, and developers to make projects feel real before they are.",
    statementHeading: "A building can be correct and still fail to move anyone.",
    statementParagraph1:
      "We close that gap. Our work makes people want to live in a project before the first brick is laid.",
    statementParagraph2:
      "Most studios run like render factories. We run like an editorial house. Every project gets a story, a tone, and an image world built around it.",
    teamLabel: "The team",
    workWithLabel: "We work with",
    workWithItems: [
      "Luxury Residential Architects",
      "Interior Designers",
      "Hospitality Architects",
      "Developers",
    ],
    ctaHeading: "Tell us what you are building.",
    ctaButtonLabel: "Begin the conversation",
  },
  {
    _id: "singleton-processPage",
    _type: "processPage",
    heroLabel: "How we work",
    heroTitle: "Our process starts before the image.",
    heroText:
      "We read the project, find its tone, and build the image world that lets others see what you see.",
    steps: [
      { _key: "s1", number: "01", title: "Read the project", body: "We study the brief, the site, the audience, and what the project is trying to prove. We ask the questions the images will have to answer." },
      { _key: "s2", number: "02", title: "Find the narrative", body: "We define the feeling. What should someone experience when they first see this project? That answer drives every image we make." },
      { _key: "s3", number: "03", title: "Build the visual language", body: "We build the reference world: mood, material, light, color, rhythm. The complete atmosphere of the project before a single frame is rendered." },
      { _key: "s4", number: "04", title: "Craft the image sequence", body: "We create every view, detail, and moment that tells the story. Nothing is generic. Nothing is accidental." },
      { _key: "s5", number: "05", title: "Prepare the project for use", body: "We deliver images built to work. For your pitch deck. Your sales launch. Your competition submission. Not just a folder of files." },
    ],
    fasesLabel: "The FASES Method",
    fasesHeading: "Every project book follows the same six-part structure.",
    ctaHeading: "Your images need to do a job.",
    ctaBody: "Let us figure out what it is.",
    ctaButtonLabel: "Begin the conversation",
  },
  {
    _id: "singleton-contactPage",
    _type: "contactPage",
    heroLabel: "Start a project",
    heroTitle: "Tell us what you are building.",
    heroText:
      "Share the project, the timeline, and what the images need to do. We reply within two hours.",
    stepTitles: [
      "Who are you?",
      "What are you building?",
      "What do you need?",
      "What should the work achieve?",
      "Timeline and scope",
      "Tell us the story.",
    ],
    continueLabel: "Continue →",
    backLabel: "← Back",
    submitLabel: "Begin the conversation",
    submittingLabel: "Sending…",
    messagePrompt:
      "Share the project, the ambition, and what the images need to achieve.",
    services: [
      "Still images",
      "Film / animation",
      "Narrative direction",
      "Competition visuals",
      "Marketing package",
      "Design exploration",
      "Not sure yet",
    ],
    goals: [
      "Sell the project",
      "Get approval",
      "Win a competition",
      "Align stakeholders",
      "Shape the design",
      "Launch a campaign",
    ],
    projectTypeOptions: [
      "Residential",
      "Hospitality",
      "Education",
      "Cultural",
      "Commercial",
      "Competition",
      "Interior",
      "Mixed-use",
    ],
    projectStageOptions: [
      "Concept",
      "Schematic Design",
      "Design Development",
      "Construction Documents",
      "Under Construction",
    ],
    budgetOptions: [
      "Under $5,000",
      "$5,000 – $15,000",
      "$15,000 – $30,000",
      "$30,000 – $60,000",
      "$60,000+",
      "To be discussed",
    ],
    thankYouHeading: "Thank you. We received your note.",
    successMessage: "We will read it with care and get back to you soon.",
  },
  {
    _id: "singleton-siteSettings",
    _type: "siteSettings",
    studioTagline: "Stories for architecture that doesn't exist yet.",
    preloaderText: "Everything you see in this website is computer generated.",
    headerCtaLabel: "Let's talk",
    navLabels: {
      caseStudies: "Case Studies",
      process: "Process",
      about: "About",
      contact: "Contact",
    },
    footerCopyright: "All rights reserved.",
    footerCities: "Buenos Aires · New York",
    headerCtaLabel: "Start a project",
    showJournal: false,
    showClientNames: false,
  },
];

// ── Push via Sanity's mutate REST API ─────────────────────
const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;

// Mutations: first delete any orphan drafts (so old draft content doesn't
// override the freshly-seeded published doc), then createOrReplace each one.
const draftDeletes = docs.map((doc) => ({
  delete: { id: `drafts.${doc._id}` },
}));
const replaces = docs.map((doc) => ({ createOrReplace: doc }));
const mutations = [...draftDeletes, ...replaces];

console.log(`Seeding ${docs.length} documents → ${dataset} (${projectId})`);

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("✗ Sanity rejected:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  const results = json.results || [];
  results.forEach((r) => {
    console.log(`  ✓ ${r.operation} ${r.id}`);
  });
  console.log(`\nDone. ${results.length} documents written.`);
  console.log("Visit /studio → Editor — every section is now click-editable.");
} catch (e) {
  console.error("✗ Network error:", e.message);
  process.exit(1);
}
