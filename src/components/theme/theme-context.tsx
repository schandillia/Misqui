"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { brandColorEnum } from "@/db/schema"
import app from "@/lib/data/app.json"

// Define the shape of the context
interface ThemeContextType {
  brandColor: string
  changeBrandColor: (color: string) => void
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Define the brand colors with value field for brandColorEnum
export const brandColors = [
  // Neutrals and Grays
  { className: "brand-slate", value: "slate", label: "Dragon Smoke" },
  { className: "brand-gray", value: "gray", label: "Cloudy Cat" },
  { className: "brand-stone", value: "stone", label: "Pebble Pop" },

  // Reds and Pinks
  { className: "brand-red", value: "red", label: "Lava Blast" },
  { className: "brand-rose", value: "rose", label: "Bubblegum Burst" },
  { className: "brand-pink", value: "pink", label: "Fairy Floss" },
  { className: "brand-fuchsia", value: "fuchsia", label: "Neon Giggle" },

  // Oranges and Yellows
  { className: "brand-orange", value: "orange", label: "Zesty Zoom" },
  { className: "brand-amber", value: "amber", label: "Honey Roar" },
  { className: "brand-yellow", value: "yellow", label: "Banana Zoom" },

  // Violets and Blues
  { className: "brand-violet", value: "violet", label: "Unicorn Twilight" },
  { className: "brand-indigo", value: "indigo", label: "Starlight Shadow" },
  { className: "brand-blue", value: "blue", label: "Shark Splash" },
  { className: "brand-sky", value: "sky", label: "Sky Scooter" },
  { className: "brand-cyan", value: "cyan", label: "Ice Pop" },

  // Teals and Greens
  { className: "brand-lime", value: "lime", label: "Lemon Rocket" },
  { className: "brand-teal", value: "teal", label: "Mermaid Tail" },
  { className: "brand-emerald", value: "emerald", label: "Dino Leaf" },
  { className: "brand-green", value: "green", label: "Froggy Fresh" },
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
  defaultBrandColor,
}: {
  children: ReactNode
  isPro: boolean
  defaultBrandColor: (typeof brandColorEnum.enumValues)[number]
}) {
  const [brandColor, setBrandColor] = useState(
    isPro ? defaultBrandColor : app.BRAND_COLOR
  )

  useEffect(() => {
    const applyBrandColor = (colorValue: string) => {
      const color = brandColors.find((c) => c.value === colorValue)
      if (!color) return

      brandColors.forEach((c) =>
        document.documentElement.classList.remove(c.className)
      )
      document.documentElement.classList.add("theme-switching")
      document.documentElement.classList.add(color.className)
      setBrandColor(colorValue)
      if (isPro) {
        localStorage.setItem("brandColor", colorValue)
      } else {
        localStorage.removeItem("brandColor")
      }
      const timeout = setTimeout(() => {
        document.documentElement.classList.remove("theme-switching")
      }, 300) // Match the transition duration in globals.css
      return timeout
    }

    if (isPro) {
      const validColor = brandColors.find(
        (color) => color.value === defaultBrandColor
      )
      if (validColor) {
        applyBrandColor(defaultBrandColor)
      } else {
        applyBrandColor("violet")
        localStorage.setItem("brandColor", "violet")
      }
    } else {
      applyBrandColor("violet")
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "brandColor" && isPro) {
        const newColor = event.newValue
        if (newColor && brandColors.find((c) => c.value === newColor)) {
          applyBrandColor(newColor)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      brandColors.forEach((color) => {
        document.documentElement.classList.remove(color.className)
      })
      document.documentElement.classList.remove("theme-switching")
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isPro, defaultBrandColor])

  const changeBrandColor = (colorValue: string) => {
    if (!isPro) return
    const validColor = brandColors.find((c) => c.value === colorValue)
    if (validColor) {
      brandColors.forEach((c) =>
        document.documentElement.classList.remove(c.className)
      )
      document.documentElement.classList.add("theme-switching")
      document.documentElement.classList.add(validColor.className)
      setBrandColor(colorValue)
      localStorage.setItem("brandColor", colorValue)
      setTimeout(() => {
        document.documentElement.classList.remove("theme-switching")
      }, 300) // Match the transition duration in globals.css
    }
  }

  return (
    <ThemeContext.Provider value={{ brandColor, changeBrandColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
