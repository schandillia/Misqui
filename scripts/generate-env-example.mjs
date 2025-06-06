import fs from "fs"
import path from "path"
import { logger } from "@/lib/logger.ts"

const envFilePath = path.resolve(process.cwd(), ".env")
const exampleFilePath = path.resolve(process.cwd(), ".env.example")

function generateEnvExample() {
  try {
    // Read the .env file
    const envContent = fs.readFileSync(envFilePath, "utf-8")

    // Split into lines and process each line
    const exampleLines = envContent.split("\n").map((line) => {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith("#")) {
        return line
      }

      // Split on first '=' to separate key and value
      const [key] = line.split("=", 1)
      return `${key.trim()}=`
    })

    // Write to .env.example
    fs.writeFileSync(exampleFilePath, exampleLines.join("\n"), "utf-8")
    logger.info(".env.example file generated successfully")
  } catch (error) {
    logger.error("Error generating .env.example: %O", {
      error,
      envFilePath,
      exampleFilePath,
      timestamp: new Date().toISOString(),
    })
    process.exit(1)
  }
}

generateEnvExample()
