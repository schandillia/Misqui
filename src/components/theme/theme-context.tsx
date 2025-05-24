"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

// Define the shape of the context
interface ThemeContextType {
  brandColor: string
  changeBrandColor: (color: string) => void
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Define the brand colors
const brandColors = [
  { className: "brand-black", label: "Black" },
  { className: "brand-red", label: "Red" },
  { className: "brand-pink", label: "Pink" },
  { className: "brand-purple", label: "Purple" },
  { className: "brand-blue", label: "Blue" },
  { className: "brand-green", label: "Green" },
  { className: "brand-yellow", label: "Yellow" },
  { className: "brand-orange", label: "Orange" },
]

// Custom hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// ThemeProvider component to provide the context
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [brandColor, setBrandColor] = useState("brand-purple") // Default brand color

  useEffect(() => {
    // Apply the default or stored brand color class to <html> on the client
    const storedBrandColor =
      localStorage.getItem("brandColor") || "brand-purple"
    const validColor = brandColors.find(
      (color) => color.className === storedBrandColor
    )
    if (validColor) {
      document.documentElement.classList.add(storedBrandColor)
      setBrandColor(storedBrandColor)
    } else {
      document.documentElement.classList.add("brand-purple")
    }

    // Cleanup: Remove all brand color classes on unmount
    return () => {
      brandColors.forEach((color) => {
        document.documentElement.classList.remove(color.className)
      })
    }
  }, []) // Empty dependency array ensures this runs once on mount

  // Function to change brand color
  const changeBrandColor = (color: string) => {
    const validColor = brandColors.find((c) => c.className === color)
    if (validColor) {
      // Remove all existing brand color classes
      brandColors.forEach((c) =>
        document.documentElement.classList.remove(c.className)
      )
      // Add the new brand color class
      document.documentElement.classList.add(color)
      setBrandColor(color)
      localStorage.setItem("brandColor", color) // Persist the choice
    }
  }

  return (
    <ThemeContext.Provider value={{ brandColor, changeBrandColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Export the brandColors array for use in the ThemeSwitcher
export { brandColors }
