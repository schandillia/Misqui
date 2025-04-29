// src/lib/logger.ts
import { existsSync, mkdirSync } from "fs"
import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

// Ensure log directory exists in production
if (process.env.NODE_ENV === "production") {
  const logDir = "logs"
  if (!existsSync(logDir)) {
    mkdirSync(logDir)
  }
}

// Create a logger instance
const logger = createLogger({
  // Log level based on environment
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",

  // Format logs: timestamp, error stack trace, and structured JSON
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }), // Log stack trace for errors
    format.splat(), // Allows interpolation like %s in log messages
    format.json() // Outputs logs in JSON format
  ),

  // Transports: where the logs go
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), // Adds color to logs in the console
        format.simple() // Simple log format for console
      ),
    }),
    // Only in production, log to rotated files
    ...(process.env.NODE_ENV === "production"
      ? [
          new DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: "error",
          }),
          new DailyRotateFile({
            filename: "logs/combined-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
        ]
      : []),
  ],
})

export { logger }
