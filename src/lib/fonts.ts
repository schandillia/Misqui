import { Nunito as FontBody } from "next/font/google"
import { Fredoka as FontHeading } from "next/font/google"

export const bodyFont = FontBody({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  style: ["normal", "italic"],
  fallback: ["system-ui", "ui-sans-serif", "Segoe UI", "Roboto", "sans-serif"],
  variable: "--font-sans",
})

export const headingFont = FontHeading({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  style: "normal",
  fallback: ["system-ui", "ui-serif", "Georgia", "serif"],
  variable: "--font-heading",
})
