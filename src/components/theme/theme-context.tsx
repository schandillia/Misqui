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
export function ThemeProvider({
  children,
  isPro,
}: {
  children: ReactNode
  isPro: boolean
}) {
  const [brandColor, setBrandColor] = useState("brand-violet") // Default brand color

  useEffect(() => {
    // Apply the default or stored brand color class to <html> on the client
    const applyBrandColor = (color: string) => {
      brandColors.forEach((c) =>
        document.documentElement.classList.remove(c.className)
      )
      document.documentElement.classList.add(color)
      setBrandColor(color)
    }

    if (isPro) {
      const storedBrandColor =
        localStorage.getItem("brandColor") || "brand-violet"
      const validColor = brandColors.find(
        (color) => color.className === storedBrandColor
      )
      if (validColor) {
        applyBrandColor(storedBrandColor)
      } else {
        applyBrandColor("brand-violet")
        localStorage.setItem("brandColor", "brand-violet")
      }
    } else {
      // For non-pro users, force brand-violet and clear localStorage
      applyBrandColor("brand-violet")
      localStorage.removeItem("brandColor")
    }

    // Listen for localStorage changes in other windows/tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "brandColor" && isPro) {
        const newColor = event.newValue
        if (newColor && brandColors.find((c) => c.className === newColor)) {
          applyBrandColor(newColor)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Cleanup: Remove all brand color classes and listener on unmount
    return () => {
      brandColors.forEach((color) => {
        document.documentElement.classList.remove(color.className)
      })
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isPro]) // Re-run if isPro changes

  // Function to change brand color
  const changeBrandColor = (color: string) => {
    if (!isPro) return // Prevent color changes for non-pro users
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
