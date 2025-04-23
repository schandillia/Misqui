import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db, accounts, sessions, users, authenticators } from "@/db/schema"
import { PostgresJsDatabase } from "drizzle-orm/postgres-js"

// Type the db connection properly
type DbType = PostgresJsDatabase<Record<string, never>>

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db as unknown as DbType, {
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
          googleId: profile.sub,
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
      // Add user ID to session object
      session.user.id = user.id
      return session
    },
  },
})
