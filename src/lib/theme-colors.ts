// src/lib/theme-colors.ts
import type { ColorThemeName, ThemeMode, Themes, SetGlobalThemeFunction } from "./theme-types";

// Helper function to convert OKLCH string to HSL string components
// This is a simplified placeholder. Real conversion is more complex.
// For now, we'll assume direct mapping for some values or use placeholders.
// Example: oklch(62.7% 0.265 303.9) -> "304 95% 63%" (approx HSL values)
// You'll need a proper conversion for your actual oklch values.

export const themes: Themes = {
  Default: { // Based on your existing globals.css (approximated to HSL)
    light: {
      background: "0 0% 100%", // oklch(1 0 0)
      foreground: "286 13% 14%", // oklch(0.141 0.005 285.823)
      card: "0 0% 100%", // oklch(1 0 0)
      cardForeground: "286 13% 14%", // oklch(0.141 0.005 285.823)
      popover: "0 0% 100%", // oklch(1 0 0)
      popoverForeground: "286 13% 14%", // oklch(0.141 0.005 285.823)
      primary: "293 89% 61%", // oklch(0.606 0.25 292.717)
      primaryForeground: "294 73% 97%", // oklch(0.969 0.016 293.756)
      secondary: "286 100% 97%", // oklch(0.967 0.001 286.375)
      secondaryForeground: "286 13% 21%", // oklch(0.21 0.006 285.885)
      muted: "286 100% 97%", // oklch(0.967 0.001 286.375)
      mutedForeground: "286 13% 55%", // oklch(0.552 0.016 285.938)
      accent: "286 100% 97%", // oklch(0.967 0.001 286.375)
      accentForeground: "286 13% 21%", // oklch(0.21 0.006 285.885)
      destructive: "27 90% 58%", // oklch(0.577 0.245 27.325)
      destructiveForeground: "0 0% 98%", // Assuming similar to other themes
      border: "286 20% 92%", // oklch(0.92 0.004 286.32)
      input: "286 20% 92%", // oklch(0.92 0.004 286.32)
      ring: "293 89% 61%", // oklch(0.606 0.25 292.717)
      radius: "0.3rem", // Your current radius
    },
    dark: {
      background: "286 13% 14%", // oklch(0.141 0.005 285.823)
      foreground: "0 0% 98%", // oklch(0.985 0 0)
      card: "286 13% 21%", // oklch(0.21 0.006 285.885)
      cardForeground: "0 0% 98%", // oklch(0.985 0 0)
      popover: "286 13% 21%", // oklch(0.21 0.006 285.885)
      popoverForeground: "0 0% 98%", // oklch(0.985 0 0)
      primary: "293 90% 54%", // oklch(0.541 0.281 293.009)
      primaryForeground: "294 73% 97%", // oklch(0.969 0.016 293.756)
      secondary: "286 10% 27%", // oklch(0.274 0.006 286.033)
      secondaryForeground: "0 0% 98%", // oklch(0.985 0 0)
      muted: "286 10% 27%", // oklch(0.274 0.006 286.033)
      mutedForeground: "286 11% 71%", // oklch(0.705 0.015 286.067)
      accent: "286 10% 27%", // oklch(0.274 0.006 286.033)
      accentForeground: "0 0% 98%", // oklch(0.985 0 0)
      destructive: "22 80% 70%", // oklch(0.704 0.191 22.216)
      destructiveForeground: "0 0% 98%", // Assuming similar
      border: "0 0% 100% / 0.1", // oklch(1 0 0 / 10%) -> HSL with alpha
      input: "0 0% 100% / 0.15", // oklch(1 0 0 / 15%) -> HSL with alpha
      ring: "293 90% 54%", // oklch(0.541 0.281 293.009)
    },
  },
  Orange: { // From reference
    light: {
      background: "0 0% 100%",
      foreground: "20 14.3% 4.1%",
      card: "0 0% 100%",
      cardForeground: "20 14.3% 4.1%",
      popover: "0 0% 100%",
      popoverForeground: "20 14.3% 4.1%",
      primary: "24.6 95% 53.1%",
      primaryForeground: "60 9.1% 97.8%",
      secondary: "60 4.8% 95.9%",
      secondaryForeground: "24 9.8% 10%",
      muted: "60 4.8% 95.9%",
      mutedForeground: "25 5.3% 44.7%",
      accent: "60 4.8% 95.9%",
      accentForeground: "24 9.8% 10%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "60 9.1% 97.8%",
      border: "20 5.9% 90%",
      input: "20 5.9% 90%",
      ring: "24.6 95% 53.1%",
      radius: "0.5rem",
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "60 9.1% 97.8%",
      card: "20 14.3% 4.1%",
      cardForeground: "60 9.1% 97.8%",
      popover: "20 14.3% 4.1%",
      popoverForeground: "60 9.1% 97.8%",
      primary: "20.5 90.2% 48.2%",
      primaryForeground: "60 9.1% 97.8%",
      secondary: "12 6.5% 15.1%",
      secondaryForeground: "60 9.1% 97.8%",
      muted: "12 6.5% 15.1%",
      mutedForeground: "24 5.4% 63.9%",
      accent: "12 6.5% 15.1%",
      accentForeground: "60 9.1% 97.8%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "60 9.1% 97.8%",
      border: "12 6.5% 15.1%",
      input: "12 6.5% 15.1%",
      ring: "20.5 90.2% 48.2%",
    },
  },
  Zinc: { // From reference
    light: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      cardForeground: "240 10% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 3.9%",
      primary: "240 5.9% 10%",
      primaryForeground: "0 0% 98%",
      secondary: "240 4.8% 95.9%",
      secondaryForeground: "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "240 4.8% 95.9%",
      accentForeground: "240 5.9% 10%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "240 5.9% 10%",
      radius: "0.5rem",
    },
    dark: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      cardForeground: "0 0% 98%",
      popover: "240 10% 3.9%",
      popoverForeground: "0 0% 98%",
      primary: "0 0% 98%",
      primaryForeground: "240 5.9% 10%",
      secondary: "240 3.7% 15.9%",
      secondaryForeground: "0 0% 98%",
      muted: "240 3.7% 15.9%",
      mutedForeground: "240 5% 64.9%",
      accent: "240 3.7% 15.9%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "240 4.9% 83.9%",
    },
  },
  // Add Blue, Green, Rose themes from reference if needed, or more custom themes
  Blue: {
    light: { background: "221.2 83.2% 53.3%", foreground: "210 40% 98%", card: "0 0% 100%", cardForeground: "222.2 84% 4.9%", popover: "0 0% 100%", popoverForeground: "222.2 84% 4.9%", primary: "221.2 83.2% 53.3%", primaryForeground: "210 40% 98%", secondary: "210 40% 96.1%", secondaryForeground: "222.2 47.4% 11.2%", muted: "210 40% 96.1%", mutedForeground: "215.4 16.3% 46.9%", accent: "210 40% 96.1%", accentForeground: "222.2 47.4% 11.2%", destructive: "0 84.2% 60.2%", destructiveForeground: "210 40% 98%", border: "214.3 31.8% 91.4%", input: "214.3 31.8% 91.4%", ring: "221.2 83.2% 53.3%", radius: "0.5rem" },
    dark: { background: "222.2 84% 4.9%", foreground: "210 40% 98%", card: "222.2 84% 4.9%", cardForeground: "210 40% 98%", popover: "222.2 84% 4.9%", popoverForeground: "210 40% 98%", primary: "217.2 91.2% 59.8%", primaryForeground: "222.2 47.4% 11.2%", secondary: "217.2 32.6% 17.5%", secondaryForeground: "210 40% 98%", muted: "217.2 32.6% 17.5%", mutedForeground: "215 20.2% 65.1%", accent: "217.2 32.6% 17.5%", accentForeground: "210 40% 98%", destructive: "0 62.8% 30.6%", destructiveForeground: "210 40% 98%", border: "217.2 32.6% 17.5%", input: "217.2 32.6% 17.5%", ring: "224.3 76.3% 48%" }
  },
  Green: {
    light: { background: "0 0% 100%", foreground: "240 10% 3.9%", card: "0 0% 100%", cardForeground: "240 10% 3.9%", popover: "0 0% 100%", popoverForeground: "240 10% 3.9%", primary: "142.1 76.2% 36.3%", primaryForeground: "355.7 100% 97.3%", secondary: "240 4.8% 95.9%", secondaryForeground: "240 5.9% 10%", muted: "240 4.8% 95.9%", mutedForeground: "240 3.8% 46.1%", accent: "240 4.8% 95.9%", accentForeground: "240 5.9% 10%", destructive: "0 84.2% 60.2%", destructiveForeground: "0 0% 98%", border: "240 5.9% 90%", input: "240 5.9% 90%", ring: "142.1 76.2% 36.3%", radius: "0.5rem" },
    dark: { background: "20 14.3% 4.1%", foreground: "0 0% 95%", card: "24 9.8% 10%", cardForeground: "0 0% 95%", popover: "0 0% 9%", popoverForeground: "0 0% 95%", primary: "142.1 70.6% 45.3%", primaryForeground: "144.9 80.4% 10%", secondary: "240 3.7% 15.9%", secondaryForeground: "0 0% 98%", muted: "0 0% 15%", mutedForeground: "240 5% 64.9%", accent: "12 6.5% 15.1%", accentForeground: "0 0% 98%", destructive: "0 62.8% 30.6%", destructiveForeground: "0 85.7% 97.3%", border: "240 3.7% 15.9%", input: "240 3.7% 15.9%", ring: "142.4 71.8% 29.2%" }
  },
  Rose: {
    light: { background: "0 0% 100%", foreground: "240 10% 3.9%", card: "0 0% 100%", cardForeground: "240 10% 3.9%", popover: "0 0% 100%", popoverForeground: "240 10% 3.9%", primary: "346.8 77.2% 49.8%", primaryForeground: "355.7 100% 97.3%", secondary: "240 4.8% 95.9%", secondaryForeground: "240 5.9% 10%", muted: "240 4.8% 95.9%", mutedForeground: "240 3.8% 46.1%", accent: "240 4.8% 95.9%", accentForeground: "240 5.9% 10%", destructive: "0 84.2% 60.2%", destructiveForeground: "0 0% 98%", border: "240 5.9% 90%", input: "240 5.9% 90%", ring: "346.8 77.2% 49.8%", radius: "0.5rem" },
    dark: { background: "20 14.3% 4.1%", foreground: "0 0% 95%", card: "24 9.8% 10%", cardForeground: "0 0% 95%", popover: "0 0% 9%", popoverForeground: "0 0% 95%", primary: "346.8 77.2% 49.8%", primaryForeground: "355.7 100% 97.3%", secondary: "240 3.7% 15.9%", secondaryForeground: "0 0% 98%", muted: "0 0% 15%", mutedForeground: "240 5% 64.9%", accent: "12 6.5% 15.1%", accentForeground: "0 0% 98%", destructive: "0 62.8% 30.6%", destructiveForeground: "0 85.7% 97.3%", border: "240 3.7% 15.9%", input: "240 3.7% 15.9%", ring: "346.8 77.2% 49.8%" }
  }
};

export const setGlobalColorTheme: SetGlobalThemeFunction = (themeMode, colorName) => {
  if (typeof document === "undefined") {
    // Guard against SSR environments
    return;
  }

  const selectedThemeVariant = themes[colorName]?.[themeMode];

  if (!selectedThemeVariant) {
    console.warn(`Theme not found: ${colorName} (${themeMode})`);
    return;
  }

  for (const [key, value] of Object.entries(selectedThemeVariant)) {
    if (value) { // Ensure value is not undefined
      // CSS variables are typically kebab-case.
      // This simple regex handles most common cases like 'cardForeground' -> 'card-foreground'
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      document.documentElement.style.setProperty(`--${cssVarName}`, value);
    }
  }
};

// Optional: Function to get the current theme from localStorage if you plan to store it this way
// export const getStoredColorTheme = (): ColorThemeName | null => {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("color-theme") as ColorThemeName | null;
// };

// Optional: Function to store the theme name
// export const storeColorTheme = (themeName: ColorThemeName): void => {
//   if (typeof window === "undefined") return;
//   localStorage.setItem("color-theme", themeName);
// };
