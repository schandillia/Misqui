// src/components/ColorThemeProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTheme } from "next-themes";
import { setGlobalColorTheme } from "@/lib/theme-colors";
import type { ColorThemeName, ThemeMode, ThemeContextType } from "@/lib/theme-types";

const LS_COLOR_THEME_KEY = "color-theme";
const DEFAULT_COLOR_THEME: ColorThemeName = "Default"; // Or any other default you prefer

const ColorThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

interface ColorThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ColorThemeName; // Optional prop to override hardcoded default
  storageKey?: string; // Optional prop to override localStorage key
}

export const ColorThemeProvider: React.FC<ColorThemeProviderProps> = ({
  children,
  defaultTheme = DEFAULT_COLOR_THEME,
  storageKey = LS_COLOR_THEME_KEY,
}) => {
  const { theme: nextThemeMode, resolvedTheme } = useTheme(); // from next-themes
  const [colorTheme, _setColorTheme] = useState<ColorThemeName>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as ColorThemeName) || defaultTheme;
  });

  // Effect to apply the theme when nextThemeMode (light/dark/system) or colorTheme (Orange/Blue) changes
  useEffect(() => {
    if (!nextThemeMode) return; // next-themes might not be ready

    // resolvedTheme gives the actual 'light' or 'dark' mode, even if nextThemeMode is 'system'
    const currentMode = resolvedTheme as ThemeMode | undefined;

    if (currentMode && colorTheme) {
      setGlobalColorTheme(currentMode, colorTheme);
    }
  }, [nextThemeMode, resolvedTheme, colorTheme]);

  const setColorTheme = (newColorThemeName: ColorThemeName) => {
    _setColorTheme(newColorThemeName);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newColorThemeName);
    }
    // Re-apply theme immediately with the new color theme and current light/dark mode
    const currentMode = resolvedTheme as ThemeMode | undefined;
    if (currentMode) {
      setGlobalColorTheme(currentMode, newColorThemeName);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};
