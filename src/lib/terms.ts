import fs from "fs"
import path from "path"
import { marked } from "marked"
import brand from "@/lib/data/brand.json"

// Configuration for dynamic values
const config = {
  brandName: brand.BRAND,
  lastRevisedDate: "April 29, 2025",
}

// Customize marked renderer to add Tailwind classes to ## headings
const renderer = new marked.Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  if (depth === 2) {
    // Apply font-bold and text-gray-700 to level 2 headings (##)
    return `<h2 class="font-bold text-neutral-700 my-2 mt-4 text-xl">${text}</h2>`
  }
  // Default rendering for other heading levels
  return `<h${depth}>${text}</h${depth}>`
}

// Configure marked with the custom renderer
marked.setOptions({
  renderer,
})

// Function to read and process the terms Markdown
export async function getTermsContent(): Promise<string> {
  try {
    // Path to the Markdown file
    const filePath = path.join(process.cwd(), "src", "lib", "data", "TERMS.md")

    // Read the Markdown file
    const markdown = fs.readFileSync(filePath, "utf-8")

    // Replace placeholders with dynamic values
    let processedMarkdown = markdown
      .replace(/{{BRAND_NAME}}/g, config.brandName)
      .replace(/{{LAST_REVISED_DATE}}/g, config.lastRevisedDate)

    // Convert Markdown to HTML
    const htmlContent = await marked(processedMarkdown)

    return htmlContent
  } catch (error) {
    console.error("Error processing terms:", error)
    return "<p>Error loading terms and conditions.</p>"
  }
}
