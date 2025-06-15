import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/drizzle"
import { accounts, sessions, users, authenticators } from "@/db/schema"
import { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"
import { generateAvatar } from "@/lib/avatar"
import { eq } from "drizzle-orm"

type NeonDB = NeonHttpDatabase<typeof schema>

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    birthdate?: string | null
    gender?: (typeof schema.genderEnum.enumValues)[number] | null
    role?: (typeof schema.roleEnum.enumValues)[number] | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      birthdate?: string | null
      gender?: (typeof schema.genderEnum.enumValues)[number] | null
      role?: (typeof schema.roleEnum.enumValues)[number] | null
    }
  }
}

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
          birthdate: profile.birthdate
            ? new Date(profile.birthdate).toISOString().split("T")[0]
            : null,
          gender: profile.gender,
          role: "user",
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
        const userData = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            birthdate: users.birthdate,
            gender: users.gender,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1)

        if (userData[0]) {
          session.user.id = userData[0].id
          session.user.name = userData[0].name
          session.user.email = userData[0].email
          session.user.image = userData[0].image
          session.user.birthdate = userData[0].birthdate
            ? userData[0].birthdate.toISOString().split("T")[0]
            : null
          session.user.gender = userData[0].gender
          session.user.role = userData[0].role
        }
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
