import { existsSync, mkdirSync } from "fs"
import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const isProd = process.env.NODE_ENV === "production"
const isVercel = !!process.env.VERCEL

let logDir = "logs"

// On Vercel, use /tmp for write access
if (isProd && isVercel) {
  logDir = "/tmp/logs"
}

// Ensure log directory exists if in prod and not Vercel preview mode
if (isProd && !existsSync(logDir)) {
  try {
    mkdirSync(logDir, { recursive: true })
  } catch (err) {
    console.warn("Could not create log directory:", err)
  }
}

const logger = createLogger({
  level: isProd ? "warn" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    ...(isProd
      ? [
          new DailyRotateFile({
            filename: `${logDir}/error-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            level: "error",
          }),
          new DailyRotateFile({
            filename: `${logDir}/combined-%DATE%.log`,
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
