// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/drizzle"
import { accounts, sessions, users, authenticators } from "@/db/schema"
import { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

type NeonDB = NeonHttpDatabase<typeof schema>

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db as NeonDB, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    authenticatorsTable: authenticators,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  // Custom logger with precise cause extraction
  logger: {
    error(error: Error) {
      let causeMessage = "Unknown error"
      if (error.cause) {
        if (error.cause instanceof Error) {
          causeMessage = error.cause.message
        } else if (typeof error.cause === "string") {
          causeMessage = error.cause
        } else if (typeof error.cause === "object" && error.cause !== null) {
          const causeObj = error.cause as any
          causeMessage =
            causeObj.err?.message || // NeonDbError message
            causeObj.message ||
            causeObj.error?.message ||
            causeObj.details?.message ||
            causeObj.cause?.message ||
            "Unknown cause"
        }
      }
      console.error(`[Auth] Error: ${error.message}`, { cause: causeMessage })
      // Debug cause structure in development
      if (process.env.NODE_ENV === "development" && error.cause) {
        console.debug("[Auth] Raw Cause:", error.cause)
      }
    },
    warn(message: string) {
      console.warn(`[Auth] Warning: ${message}`)
    },
    debug(message: string, metadata?: any) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Auth] Debug: ${message}`, metadata)
      }
    },
  },
})
