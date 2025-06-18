import NextAuth, { NextAuthConfig } from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, initializeDb } from "@/db/drizzle"
import { accounts, sessions, users, authenticators } from "@/db/schema"
import * as schema from "@/db/schema"
import { generateAvatar } from "@/lib/avatar"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"

// Tip: Lazy-load providers to reduce middleware bundle size.
// Example: Add more providers like GitHub, Facebook etc. here.
const Google = () =>
  import("next-auth/providers/google").then((mod) => mod.default)

/**
 * If you want to add a new provider, follow these steps:
 * 1. Import it lazily (like Google above).
 *    For example:
 *    const GitHub = () => import("next-auth/providers/github").then((mod) => mod.default)
 *
 * 2. In the `providers` array below, add:
 *    (await GitHub())({
 *      clientId: process.env.AUTH_GITHUB_ID,
 *      clientSecret: process.env.AUTH_GITHUB_SECRET,
 *      profile(profile) {
 *        return {
 *          id: profile.id,
 *          name: profile.name,
 *          email: profile.email,
 *          image: profile.avatar_url,
 *          birthdate: null, // If GitHub doesn’t return birthdate
 *          gender: null, // If not applicable
 *        }
 *      },
 *    }),
 *
 * 3. Set corresponding environment variables:
 *    AUTH_GITHUB_ID=xxx
 *    AUTH_GITHUB_SECRET=xxx
 */

// Extend the default User and Session interfaces with custom fields
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
    user: User
  }
}

// Create the NextAuth configuration dynamically
async function createAuthConfig(): Promise<NextAuthConfig> {
  const initializedDb = await initializeDb()

  return {
    // Auth.js adapter for Drizzle ORM
    adapter: DrizzleAdapter(initializedDb, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      authenticatorsTable: authenticators,
    }),

    // Add providers here
    providers: [
      (await Google())({
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
          }
        },
      }),
      // Add more providers below (see instructions above)
    ],

    session: {
      strategy: "database", // Store session in DB
    },

    callbacks: {
      // Extend session with DB data
      async session({ session, user }) {
        if (session.user) {
          const userData = await db.instance
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

    // Custom logger using your app's logging system
    logger: {
      error(error: Error) {
        const causeMessage =
          error.cause instanceof Error
            ? error.cause.message
            : typeof error.cause === "string"
              ? error.cause
              : "Unknown error"
        logger.error(`[Auth] Error: ${error.message}`, {
          cause: causeMessage,
        })
      },
      warn(message: string) {
        logger.warn(`[Auth] Warning: ${message}`)
      },
      debug(message: string, metadata?: unknown) {
        if (process.env.NODE_ENV === "development") {
          logger.debug(`[Auth] Debug: ${message}`, { metadata })
        }
      },
    },
  }
}

// Export NextAuth handlers
export const { handlers, auth, signIn, signOut } = NextAuth(() =>
  createAuthConfig()
)
