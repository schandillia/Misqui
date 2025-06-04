import fs from "fs"
import path from "path"
import { marked } from "marked"
import brand from "@/lib/data/brand.json"
import { logger } from "@/lib/logger"

// Global configuration defaults
const defaultPlaceholders = {
  BRAND_NAME: brand.BRAND,
  LAST_REVISED_DATE: "April 29, 2025",
}

// Customize marked renderer
const renderer = new marked.Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  if (depth === 2) {
    return `<h2 class="font-bold text-neutral-700 dark:text-neutral-400 my-2 mt-4 text-xl">${text}</h2>`
  }
  return `<h${depth}>${text}</h${depth}>`
}

marked.setOptions({ renderer })

// Main function
export async function getLegalContent(
  fileName: "TERMS.md" | "PRIVACY.md",
  customPlaceholders: Record<string, string> = {}
): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "data",
    "legal",
    fileName
  )

  try {
    const markdown = fs.readFileSync(filePath, "utf-8")

    const placeholders = {
      ...defaultPlaceholders,
      ...customPlaceholders,
    }

    // Replace all placeholders
    const processedMarkdown = Object.entries(placeholders).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, "g"), value),
      markdown
    )

    const htmlContent = await marked(processedMarkdown)
    return htmlContent
  } catch (error) {
    logger.error("Error processing legal content: %O", {
      error,
      filePath,
      timestamp: new Date().toISOString(),
    })
    return "<p>Error loading legal content.</p>"
  }
}
