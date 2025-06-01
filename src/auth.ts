// src/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/drizzle"
import { accounts, sessions, users, authenticators } from "@/db/schema"
import { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"
import { generateAvatar } from "@/lib/avatar"

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
          name: profile.name ?? "Student",
          email: profile.email,
          image: generateAvatar(profile.sub),
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
        session.user.image = user.image
      }
      return session
    },
  },
  logger: {
    error(error: Error) {
      const causeMessage =
        error.cause instanceof Error
          ? error.cause.message
          : typeof error.cause === "string"
            ? error.cause
            : "Unknown error"
      console.error(`[Auth] Error: ${error.message}`, {
        cause: causeMessage,
      })
    },
    warn(message: string) {
      console.warn(`[Auth] Warning: ${message}`)
    },
    debug(message: string, metadata?: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Auth] Debug: ${message}`, metadata)
      }
    },
  },
})
