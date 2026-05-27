import { groq } from "next-sanity";

const imageFields = groq`
  asset->,
  alt,
  hotspot,
  crop
`;

const projectFields = groq`
  _id,
  title,
  "slug": slug.current,
  collectionLabel,
  subtitle,
  shortDescription,
  coverImage{ ${imageFields} },
  heroMedia{ ${imageFields} },
  "projectType": projectType->title,
  country,
  city,
  year,
  clientName,
  clientVisibility,
  mainGoal,
  featured,
  sortOrder
`;

const phaseFields = groq`
  _id,
  phaseNumber,
  phaseTitle,
  description,
  whatItIs,
  whatItContains,
  introText,
  quote,
  mainImage{ ${imageFields} },
  gallery[]{ ${imageFields} },
  video,
  materials,
  colorPalette,
  layoutType
`;

export const allProjectsQuery = groq`
  *[_type == "project"] | order(featured desc, sortOrder asc, year desc) {
    ${projectFields}
  }
`;

export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true] | order(sortOrder asc) {
    ${projectFields}
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    ${projectFields},
    architect,
    interiorDesigner,
    developer,
    services,
    seoTitle,
    seoDescription,
    openGraphImage{ ${imageFields} },
    credits,
    "phases": phases[]-> {
      ${phaseFields}
    },
    "testimonial": testimonial-> {
      _id,
      quote,
      shortQuote,
      personName,
      personTitle,
      company,
      displayName,
      approved,
      tone
    },
    "relatedProjects": relatedProjects[]-> {
      ${projectFields}
    }
  }
`;

export const allProjectSlugsQuery = groq`
  *[_type == "project"] { "slug": slug.current }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    defaultSeoTitle,
    defaultSeoDescription,
    contactEmail,
    showJournal,
    showClientNames,
    socialLinks,
    studioTagline,
    preloaderText,
    headerCtaLabel,
    navLabels,
    footerCopyright,
    footerCities
  }
`;

export const homePageQuery = groq`
  *[_type == "homePage"][0] {
    heroLabel,
    heroTitle,
    heroSubtext,
    heroPrimaryCta,
    heroSecondaryCta,
    featuredLabel,
    featuredHeading,
    featuredViewAllLabel,
    positioningHeading,
    positioningParagraph1,
    positioningParagraph2,
    positioningStatement,
    fasesLabel,
    fasesButtonLabel,
    peerBandHeading,
    peerBandQuote,
    peerBandAuthorName,
    peerBandAuthorTitle,
    clientMarks,
    factStrip,
    aboutLabel,
    aboutHeading,
    aboutBody,
    aboutButtonLabel,
    finalCtaHeading,
    finalCtaButtonLabel,
    seoTitle,
    seoDescription
  }
`;

export const aboutPageQuery = groq`
  *[_type == "aboutPage"][0] {
    heroLabel,
    heroTitle,
    heroText,
    statementHeading,
    statementParagraph1,
    statementParagraph2,
    studioStatement,
    studioText,
    teamLabel,
    workWithLabel,
    workWithItems,
    ctaHeading,
    ctaButtonLabel,
    seoTitle,
    seoDescription
  }
`;

export const processPageQuery = groq`
  *[_type == "processPage"][0] {
    heroLabel,
    heroTitle,
    heroText,
    steps[]{ number, title, body },
    fasesLabel,
    fasesHeading,
    ctaHeading,
    ctaBody,
    ctaButtonLabel,
    seoTitle,
    seoDescription
  }
`;

export const contactPageQuery = groq`
  *[_type == "contactPage"][0] {
    heroLabel,
    heroTitle,
    heroText,
    stepTitles,
    continueLabel,
    backLabel,
    submitLabel,
    submittingLabel,
    messagePrompt,
    services,
    goals,
    projectTypeOptions,
    projectStageOptions,
    budgetOptions,
    thankYouHeading,
    successMessage,
    seoTitle,
    seoDescription
  }
`;

export const teamMembersQuery = groq`
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    portrait{ ${imageFields} },
    shortBio,
    longBio,
    order
  }
`;

export const allJournalPostsQuery = groq`
  *[_type == "journalPost" && published == true] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage{ ${imageFields} },
    "author": author->{ name, role },
    date
  }
`;

export const journalPostBySlugQuery = groq`
  *[_type == "journalPost" && slug.current == $slug && published == true][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage{ ${imageFields} },
    "author": author->{ name, role, portrait{ ${imageFields} } },
    date,
    body,
    seoTitle,
    seoDescription
  }
`;
