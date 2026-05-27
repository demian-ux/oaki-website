import project from "./project";
import phase from "./phase";
import projectType from "./projectType";
import location from "./location";
import testimonial from "./testimonial";
import teamMember from "./teamMember";
import journalPost from "./journalPost";
import siteSettings from "./siteSettings";
import formSubmission from "./formSubmission";
import homePage from "./homePage";
import processPage from "./processPage";
import aboutPage from "./aboutPage";
import contactPage from "./contactPage";

export const schemaTypes = [
  // Content
  project,
  phase,
  projectType,
  location,
  testimonial,
  teamMember,
  journalPost,
  // Pages (singletons)
  homePage,
  processPage,
  aboutPage,
  contactPage,
  // Config
  siteSettings,
  formSubmission,
];
