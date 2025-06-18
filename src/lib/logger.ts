// src/lib/logger.ts
export type LogMetadata = Record<string, unknown>

export const logger = {
  info: (message: string, meta?: LogMetadata) => {
    console.info(
      JSON.stringify({
        level: "INFO",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    )
  },
  error: (message: string, meta?: LogMetadata) => {
    console.error(
      JSON.stringify({
        level: "ERROR",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    )
  },
  warn: (message: string, meta?: LogMetadata) => {
    console.warn(
      JSON.stringify({
        level: "WARN",
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      })
    )
  },
  debug: (message: string, meta?: LogMetadata) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        JSON.stringify({
          level: "DEBUG",
          timestamp: new Date().toISOString(),
          message,
          ...meta,
        })
      )
    }
  },
}
