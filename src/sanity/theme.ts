import { buildLegacyTheme } from "sanity";

const oaki = {
  ink:   "#222222",
  paper: "#ffffff",
  warm:  "#c6b193",
  soft:  "#f4f2ee",
  line:  "#e8e5df",
  muted: "#8f8a82",
};

export const oakiTheme = buildLegacyTheme({
  "--gray-base": oaki.muted,
  "--component-bg":         oaki.paper,
  "--component-text-color": oaki.ink,
  "--main-navigation-color":           oaki.ink,
  "--main-navigation-color--inverted": oaki.paper,
  "--focus-color": oaki.warm,
  "--state-success-color": "#4a7c59",
  "--state-warning-color": "#b8864e",
  "--state-danger-color":  "#c0392b",
  "--state-info-color":    oaki.muted,
  "--default-button-primary-color":   oaki.ink,
  "--default-button-success-color":   "#4a7c59",
  "--default-button-warning-color":   "#b8864e",
  "--default-button-danger-color":    "#c0392b",
} as Parameters<typeof buildLegacyTheme>[0]);
