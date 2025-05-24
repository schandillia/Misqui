// src/lib/theme-types.ts

// Defines the names of the available color themes.
// We'll start with a few examples based on the reference and your existing theme.
// This can be expanded later.
export type ColorThemeName = "Orange" | "Blue" | "Green" | "Rose" | "Zinc" | "Default";

// Defines the theme mode.
export type ThemeMode = "light" | "dark";

// Defines the structure for a single theme variant (either light or dark).
// These are the CSS variable names (without the '--' prefix) and their HSL string values.
export type ThemeVariant = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius?: string; // Optional, as in the reference
  // You can add other properties from your globals.css here if they need to be themed
  // For example:
  // "chart-1"?: string;
  // "sidebar"?: string;
  // ... etc.
};

// Defines the overall structure for all themes.
// It's an object where each key is a ColorThemeName,
// and the value contains 'light' and 'dark' ThemeVariants.
export type Themes = {
  [key in ColorThemeName]: {
    light: ThemeVariant;
    dark: ThemeVariant;
  };
};

// Type for the function that will apply themes.
export type SetGlobalThemeFunction = (
  themeMode: ThemeMode,
  colorName: ColorThemeName
) => void;

// Type for the properties that will be exposed by the ThemeProvider context
export type ThemeContextType = {
  colorTheme: ColorThemeName;
  setColorTheme: (themeName: ColorThemeName) => void;
  // We will still use useTheme from next-themes for light/dark/system
};
