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
  // Neutrals and Grays
  { className: "brand-slate", label: "Dragon Smoke" },
  { className: "brand-gray", label: "Cloudy Cat" },
  { className: "brand-stone", label: "Pebble Pop" },

  // Reds and Pinks
  { className: "brand-red", label: "Lava Blast" },
  { className: "brand-rose", label: "Bubblegum Burst" },
  { className: "brand-pink", label: "Fairy Floss" },
  { className: "brand-fuchsia", label: "Neon Giggle" },

  // Oranges and Yellows
  { className: "brand-orange", label: "Zesty Zoom" },
  { className: "brand-amber", label: "Honey Roar" },
  { className: "brand-yellow", label: "Banana Zoom" },

  // Violets and Blues
  { className: "brand-violet", label: "Unicorn Twilight" },
  { className: "brand-indigo", label: "Starlight Shadow" },
  { className: "brand-blue", label: "Shark Splash" },
  { className: "brand-sky", label: "Sky Scooter" },
  { className: "brand-cyan", label: "Ice Pop" },

  // Teals and Greens
  { className: "brand-lime", label: "Lemon Rocket" },
  { className: "brand-teal", label: "Mermaid Tail" },
  { className: "brand-emerald", label: "Dino Leaf" },
  { className: "brand-green", label: "Froggy Fresh" },
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
  const [brandColor, setBrandColor] = useState("brand-violet") // Default brand color

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
